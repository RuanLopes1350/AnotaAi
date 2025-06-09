import taskRepository from '../repository/taskRepository.js';
import mongoose from 'mongoose';
import { z } from 'zod'
import { taskZodSchema } from '../utils/validation/taskZodSchema.js';
import { taskUpdateZodSchema } from '../utils/validation/taskZodSchema.js';
import Logger from '../utils/helpers/logger.js';

class TaskService {
    constructor() {
        this.taskRepository = new taskRepository();
        Logger.debug("TaskService instanciado");
    }

    async cadastrarTarefa(dadosTarefa) {
        const idOperacao = Logger.iniciarOperacao('cadastrarTarefa', 'Iniciando cadastro de tarefa', { 
            dados: this._ocultarDadosSensiveis(dadosTarefa) 
        });

        try {
            const dadosValidados = taskZodSchema.parse(dadosTarefa);
            Logger.debug(`[${idOperacao}] Dados de tarefa validados com sucesso`);

            const novaTarefa = await this.taskRepository.cadastrarTarefa(dadosValidados);
            Logger.finalizarOperacao(idOperacao, 'cadastrarTarefa', 'Tarefa cadastrada com sucesso', { 
                tarefaId: novaTarefa._id,
                titulo: novaTarefa.titulo
            });
            
            return novaTarefa;

        } catch (erro) {
            if (erro instanceof z.ZodError) {
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));
                
                Logger.warn(`[${idOperacao}] Erro de validação nos dados da tarefa`, { erros });

                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados da tarefa',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            Logger.registrarErro(idOperacao, 'cadastrarTarefa', erro);
            throw erro;
        }
    }

    async editarTarefa(id, dadosTarefa) {
        const idOperacao = Logger.iniciarOperacao('editarTarefa', 'Iniciando edição de tarefa', { 
            id, 
            dados: this._ocultarDadosSensiveis(dadosTarefa) 
        });

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                Logger.warn(`[${idOperacao}] ID de tarefa inválido: ${id}`);
                
                throw {
                    name: 'ValidationError',
                    message: 'ID inválido',
                    status: 400,
                    details: 'O ID fornecido não é um ObjectId válido do MongoDB'
                };
            }

            const dadosValidados = taskUpdateZodSchema.parse(dadosTarefa);
            Logger.debug(`[${idOperacao}] Dados de edição validados com sucesso`);

            const tarefaAtualizada = await this.taskRepository.editarTarefa(id, dadosValidados);
            
            if (!tarefaAtualizada) {
                Logger.warn(`[${idOperacao}] Tarefa não encontrada para edição`);
                
                throw {
                    name: 'NotFoundError',
                    message: `Tarefa com ID '${id}' não encontrada`,
                    status: 404,
                    details: 'A tarefa que você está tentando editar não existe.'
                };
            }

            Logger.finalizarOperacao(idOperacao, 'editarTarefa', 'Tarefa editada com sucesso', {
                id: tarefaAtualizada._id,
                titulo: tarefaAtualizada.titulo,
                status: tarefaAtualizada.status
            });
            
            return tarefaAtualizada;
        } catch (erro) {
            if (erro instanceof z.ZodError) {
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));
                
                Logger.warn(`[${idOperacao}] Erro de validação ao editar tarefa`, { erros });

                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados da tarefa',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            // Se já for um erro formatado
            if (erro.status && erro.name) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'editarTarefa', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao editar tarefa',
                status: 500,
                details: erro.message
            };
        }
    }

    async listarTarefas(filtros = {}, opcoes = { page: 1, limit: 10 }) {
        const idOperacao = Logger.iniciarOperacao('listarTarefas', 'Iniciando listagem de tarefas', { 
            filtros, 
            opcoes 
        });

        try {
            const tarefas = await this.taskRepository.listarTarefas(filtros, opcoes);
            
            if (!tarefas || (tarefas.docs && tarefas.docs.length === 0)) {
                Logger.info(`[${idOperacao}] Nenhuma tarefa encontrada com os filtros aplicados`);
                return tarefas;
            }
            
            if (tarefas.docs) {
                Logger.finalizarOperacao(idOperacao, 'listarTarefas', 'Tarefas listadas com sucesso', { 
                    total: tarefas.totalDocs,
                    pagina: tarefas.page,
                    totalPaginas: tarefas.totalPages
                });
            } else {
                Logger.finalizarOperacao(idOperacao, 'listarTarefas', 'Tarefas listadas com sucesso', { 
                    total: tarefas.length 
                });
            }
            
            return tarefas;
        } catch (erro) {
            Logger.registrarErro(idOperacao, 'listarTarefas', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao listar tarefas',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorTitulo(titulo) {
        const idOperacao = Logger.iniciarOperacao('buscarTarefaPorTitulo', 'Buscando tarefa por título', { 
            titulo 
        });

        try {
            const tarefa = await this.taskRepository.buscarTarefaPorTitulo(titulo);

            if (!tarefa) {
                Logger.warn(`[${idOperacao}] Nenhuma tarefa encontrada com o título '${titulo}'`);

                throw {
                    name: 'NotFoundError',
                    message: `Tarefa com título '${titulo}' não encontrada`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde ao título informado.'
                };
            }
            
            Logger.finalizarOperacao(idOperacao, 'buscarTarefaPorTitulo', 'Tarefa encontrada com sucesso', {
                id: tarefa._id,
                titulo: tarefa.titulo
            });
            
            return tarefa;
        } catch (erro) {
            // Verificar se já é um erro tratado
            if (erro.name && erro.status) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'buscarTarefaPorTitulo', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por título',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorStatus(status) {
        const idOperacao = Logger.iniciarOperacao('buscarTarefaPorStatus', 'Buscando tarefas por status', { 
            status 
        });

        try {
            const tarefas = await this.taskRepository.buscarTarefaPorStatus(status);

            if (!tarefas || tarefas.length === 0) {
                Logger.warn(`[${idOperacao}] Nenhuma tarefa encontrada com o status '${status}'`);

                throw {
                    name: 'NotFoundError',
                    message: `Nenhuma tarefa encontrada com o status '${status}'`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde ao status informado.'
                };
            }
            
            Logger.finalizarOperacao(idOperacao, 'buscarTarefaPorStatus', 'Tarefas encontradas com sucesso', {
                status,
                quantidade: tarefas.length
            });
            
            return tarefas;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'buscarTarefaPorStatus', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por status',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorDataLimite(dataLimite) {
        const dataFormatada = dataLimite instanceof Date ? 
            dataLimite.toLocaleDateString('pt-BR') : dataLimite;
            
        const idOperacao = Logger.iniciarOperacao('buscarTarefaPorDataLimite', 'Buscando tarefas por data limite', { 
            dataLimite: dataFormatada 
        });

        try {
            const tarefas = await this.taskRepository.buscarTarefaPorDataLimite(dataLimite);

            if (!tarefas || tarefas.length === 0) {
                Logger.warn(`[${idOperacao}] Nenhuma tarefa encontrada com a data limite '${dataFormatada}'`);

                throw {
                    name: 'NotFoundError',
                    message: `Nenhuma tarefa encontrada com a data limite '${dataFormatada}'`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde à data limite informada.'
                };
            }
            
            Logger.finalizarOperacao(idOperacao, 'buscarTarefaPorDataLimite', 'Tarefas encontradas com sucesso', {
                dataLimite: dataFormatada,
                quantidade: tarefas.length
            });
            
            return tarefas;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'buscarTarefaPorDataLimite', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por data limite',
                status: 500,
                details: erro.message
            };
        }
    }

    async deletarTarefa(id) {
        const idOperacao = Logger.iniciarOperacao('deletarTarefa', 'Iniciando exclusão de tarefa', { 
            id 
        });

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                Logger.warn(`[${idOperacao}] ID de tarefa inválido para exclusão: ${id}`);
                
                throw {
                    name: 'ValidationError',
                    message: 'ID inválido',
                    status: 400,
                    details: 'O ID fornecido não é um ObjectId válido do Mongo.'
                };
            }

            const tarefaDeletada = await this.taskRepository.deletarTarefa(id);

            if (!tarefaDeletada) {
                Logger.warn(`[${idOperacao}] Tarefa não encontrada para exclusão: ${id}`);
                
                throw {
                    name: 'NotFoundError',
                    message: `Tarefa com ID '${id}' não encontrada`,
                    status: 404,
                    details: 'A tarefa que você está tentando deletar não existe.'
                };
            }

            Logger.finalizarOperacao(idOperacao, 'deletarTarefa', 'Tarefa excluída com sucesso', {
                id,
                titulo: tarefaDeletada.titulo
            });
            
            return tarefaDeletada;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'deletarTarefa', erro);
            
            throw {
                name: 'DatabaseError',
                message: 'Erro ao deletar tarefa',
                status: 500,
                details: erro.message
            };
        }
    }

    // Método auxiliar para ocultar dados sensíveis nos logs
    _ocultarDadosSensiveis(dados) {
        if (!dados) return dados;
        
        const dadosOcultos = { ...dados };
        const camposSensiveis = ['senha', 'password', 'token', 'segredo'];
        
        camposSensiveis.forEach(campo => {
            if (dadosOcultos[campo]) {
                dadosOcultos[campo] = '[OCULTO]';
            }
        });
        
        return dadosOcultos;
    }
}

export default TaskService;