import userRepository from '../repository/userRepository.js';
import mongoose from 'mongoose';
import { z } from 'zod';
import { userZodSchema, userUpdateZodSchema } from '../utils/validation/userZodSchema.js';
import Logger from '../utils/helpers/logger.js';

class UserService {
    constructor() {
        this.userRepository = new userRepository();
        Logger.debug('UserService instanciado');
    }

    async cadastrarUsuario(usuario) {
        const idOperacao = Logger.iniciarOperacao('cadastrarUsuario', 'Iniciando cadastro de usuário', {
            dados: this._ocultarDadosSensiveis(usuario)
        });

        try {
            const dadosValidados = userZodSchema.parse(usuario);
            Logger.debug(`[${idOperacao}] Dados de usuário validados com sucesso`);

            const novoUsuario = await this.userRepository.cadastrarUsuario(dadosValidados);
            Logger.finalizarOperacao(idOperacao, 'cadastrarUsuario', 'Cadastro de usuário concluído', {
                usuarioId: novoUsuario._id,
                nome: novoUsuario.nome,
            });
            return novoUsuario;
        } catch (erro) {
            if (erro instanceof z.ZodError) {
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));
                Logger.warn(`[${idOperacao}] Erros de validação nos dados do usuário`, { erros });

                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados do usuário',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            Logger.registrarErro(idOperacao, 'cadastrarUsuario', erro);
            throw erro;
        }
    }

    async editarUsuario(id, usuario) {
        const idOperacao = Logger.iniciarOperacao('editarUsuario', 'Iniciando edição de usuário', {
            id,
            dados: this._ocultarDadosSensiveis(usuario)
        });

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                Logger.warn(`[${idOperacao}] ID inválido fornecido: ${id}`);
                throw {
                    name: 'ValidationError',
                    message: 'ID inválido',
                    status: 400,
                    details: 'O ID fornecido não é um ObjectId válido do MongoDB'
                };
            }

            const dadosValidados = userUpdateZodSchema.parse(usuario);
            Logger.debug(`[${idOperacao}] Dados de usuário validados com sucesso`);

            const usuarioAtualizado = await this.userRepository.editarUsuario(id, dadosValidados);

            if (!usuarioAtualizado) {
                Logger.warn(`[${idOperacao}] Usuário não encontrado para edição`);

                throw {
                    name: 'NotFoundError',
                    message: `Usuário com ID '${id}' não encontrado`,
                    status: 404,
                    details: `Usuário que você está tentando editar não existe.`
                };
            }

            Logger.finalizarOperacao(idOperacao, 'editarUsuario', 'Edição de usuário concluída', {
                id: usuarioAtualizado._id,
                nome: usuarioAtualizado.nome,
                email: usuarioAtualizado.email
            });
            return usuarioAtualizado;
        } catch (erro) {
            if (erro instanceof z.ZodError) {
                const erros = erro.errors.map(err => ({
                    campo: err.path.join('.'),
                    mensagem: err.message
                }));
                Logger.warn(`[${idOperacao}] Erros de validação nos dados do usuário`, { erros });

                const erroFormatado = {
                    name: 'ValidationError',
                    message: 'Erro de validação nos dados do usuário',
                    status: 400,
                    details: erros
                };
                throw erroFormatado;
            }

            if(erro.status && erro.name) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'editarUsuario', erro);
            throw {
                name: 'DatabaseError',
                message: 'Erro ao editar usuário',
                status: 500,
                details: erro.message
            };
        }
    }

    async deletarUsuario(id) {
        const idOperacao = Logger.iniciarOperacao('deletarUsuario', 'Iniciando exclusão do usuário', {
            id
        });

        try {
            if (!mongoose.Types.ObjectId.isValid(id)) {
                Logger.warn(`[${idOperacao}] ID de usuário inválido para exclusão: ${id}`);

                throw {
                    name: 'ValidationError',
                    message: 'ID inválido',
                    status: 400,
                    details: 'O ID fornecido não é um ObjectId válido do Mongo.'
                }
            }

            const usuarioDeletado = await this.userRepository.deletarUsuario(id);

            if(!usuarioDeletado) {
                Logger.warn(`[${idOperacao}] Usuário não encontrado para exclusão: ${id}`);

                throw {
                    name: 'NotFoundError',
                    message: `Usuário com ID '${id}' não encontrado`,
                    status: 404,
                    details: 'O usuário que você está tentando deletar não existe.'
                };
            }

            Logger.finalizarOperacao(idOperacao, 'deletarUsuario', 'Usuário excluído com sucesso', {
                id,
                nome: usuarioDeletado.nome
            });
            return usuarioDeletado;
        } catch (erro) {
            if (erro.name && erro.status) {
                throw erro;
            }

            Logger.registrarErro(idOperacao, 'deletarUsuario', erro);

            throw {
                name: 'DatabaseError',
                message: 'Erro ao deletar usuário',
                status: 500,
                details: erro.message
            };
        }
    }

    _ocultarDadosSensiveis(dados) {
        if(!dados) return dados;

        const dadosOcultos = {...dados};
        const camposSensiveis = ['senha','token', 'respostaSeguranca'];

        camposSensiveis.forEach(campo => {
            if(dadosOcultos[campo]) {
                dadosOcultos[campo] = '[OCULTO]';
            }
        });

        return dadosOcultos;
    }
}

export default UserService;