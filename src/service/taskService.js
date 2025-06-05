import taskRepository from '../repository/taskRepository.js';
import mongoose from 'mongoose';
import { z } from 'zod'
import { taskZodSchema } from '../utils/validation/taskZodSchema.js';
import { taskUpdateZodSchema } from '../utils/validation/taskZodSchema.js';

class TaskService {
    constructor() {
        this.taskRepository = new taskRepository();
    }

    async cadastrarTarefa(dadosTarefa) {
        console.log("Estou em cadastrar tarefa de TaskService");

        try {
            const dadosValidados = taskZodSchema.parse(dadosTarefa);

            // Se chegou aqui, a validação foi bem-sucedida
            // Prosseguir com o cadastro usando os dados validados
            const novaTarefa = await this.taskRepository.cadastrarTarefa(dadosValidados);
            return novaTarefa;

        } catch (erro) {
            // Verifica se é um erro do Zod
            if (erro instanceof z.ZodError) {
                // Formata os erros do Zod para fácil consumo pelo controller
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));

                // Cria um objeto de erro personalizado
                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados da tarefa',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            // Se não for erro do Zod, repassa o erro original
            throw erro;
        }
    }

    async editarTarefa(id, dadosTarefa) {
        console.log("Estou em editar tarefa de TaskService");

        try {
            const dadosValidados = taskUpdateZodSchema.parse(dadosTarefa);
            const tarefaAtualizada = await this.taskRepository.editarTarefa(id, dadosValidados);
            return tarefaAtualizada;
        } catch (erro) {

            if (erro instanceof z.ZodError) {
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }))

                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados da tarefa',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            throw erro;
        }
    }

    async listarTarefas(filtros = {}, opcoes = { page: 1, limit: 10 }) {
        console.log("Estou em listar tarefas de TaskService");

        try {
            const tarefas = await this.taskRepository.listarTarefas(filtros, opcoes);

            if (!tarefas || tarefas.length === 0) {
                return [];
            }

            return tarefas;
        } catch (erro) {
            console.error("Erro ao listar tarefas:", erro);

            // Lançar um erro personalizado para o controller lidar
            throw {
                name: 'DatabaseError',
                message: 'Erro ao listar tarefas',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorTitulo(titulo) {
        console.log("Estou em buscar tarefa por titulo de TaskService");

        try {
            const tarefa = await this.taskRepository.buscarTarefaPorTitulo(titulo);

            // Verificar se retornou uma tarefa
            if (!tarefa) {

                //Lançar um erro específico de "não encontrado"
                throw {
                    name: 'NotFoundError',
                    message: `Tarefa com título '${titulo}' não encontrada`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde ao título informado.'
                };
            }

            return tarefa;
        } catch (erro) {
            // Verificar se já é um erro tratado (como o NotFoundError acima)
            if (erro.name && erro.status) {
                throw erro; // Se já for um erro formatado, apenas repassa
            }

            console.error("Erro ao buscar tarefa por título:", erro);
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por título',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorStatus(status) {
        console.log("Estou em buscar tarefa por status de TaskService");

        try {
            const tarefas = await this.taskRepository.buscarTarefaPorStatus(status);

            if (!tarefas) {
                throw {
                    name: 'NotFoundError',
                    message: `Nenhuma tarefa encontrada com o status '${status}'`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde ao status informado.'
                }
            }
            return tarefas;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            console.error("Erro ao buscar tarefa por status:", erro);
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por status',
                status: 500,
                details: erro.message
            };
        }
    }

    async buscarTarefaPorDataLimite(dataLimite) {
        console.log("Estou em buscar tarefa por data limite de TaskService");

        try {
            const tarefas = await this.taskRepository.buscarTarefaPorDataLimite(dataLimite);

            if (!tarefas) {
                throw {
                    name: 'NotFoundError',
                    message: `Nenhuma tarefa encontrada com a data limite '${dataLimite}'`,
                    status: 404,
                    details: 'A busca foi concluída com sucesso, mas nenhuma tarefa corresponde à data limite informada.'
                };
            }
            return tarefas;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            console.error("Erro ao buscar tarefa por data limite:", erro);
            throw {
                name: 'DatabaseError',
                message: 'Erro ao buscar tarefa por data limite',
                status: 500,
                details: erro.message
            };
        }
    }

    async deletarTarefa(id) {
        console.log("Estou em deletar tarefa de TaskService");

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw {
                    name: 'ValidationError',
                    message: 'ID inválido',
                    status: 400,
                    details: 'O ID fornecido não é um ObjectId válido do Mongoose.'
                };
            }

            const tarefaDeletada = await this.taskRepository.deletarTarefa(id);

            // Verifica se a tarefa foi encontrada e deletada
            if (!tarefaDeletada) {
                throw {
                    name: 'NotFoundError',
                    message: `Tarefa com ID '${id}' não encontrada`,
                    status: 404,
                    details: 'A tarefa que você está tentando deletar não existe.'
                };
            }

            return tarefaDeletada;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            console.error("Erro ao deletar tarefa:", erro);
            throw {
                name: 'DatabaseError',
                message: 'Erro ao deletar tarefa',
                status: 500,
                details: erro.message
            };
        }
    }
}

export default TaskService;