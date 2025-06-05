import UserService from "../service/userService";
import { buildMongoQueryFromParams } from "../utils/validation/queryUserZodSchema";

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async cadastrarUsuario(req, res) {
        const novoUsuario = await this.taskService.cadastrarUsuario(req.body);
        return res.status(201).json({
            message: 'Tarefa cadastrada com sucesso',
            tarefa: novaTarefa
        });
    }

    async editarUsuario(req, res) {
        try {
            const { id } = req.params;

            const usuarioAtualizado = await this.userService.editarUsuario(id, req.body);

            if (!usuarioAtualizado) {
                return res.status(404).json({
                    message: 'Usuário não'
                });
            }

            return res.status(200).json({
                message: 'Usuario atualizado com sucesso',
                tarefa: usuarioAtualizado
            });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao atualizar usuario',
                details: erro.details || erro.message
            });
        }
    }

    async deletarUsuario(req, res) {
        try {
            const { id } = req.params;
            const usuarioDeletado = await this.userService.deletarTarefa(id);

            return res.status(200).json({
                message: 'Tarefa deletada com sucesso',
                tarefa: tarefaDeletada,
            });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao deletar tarefa',
                details: erro.details || erro.message
            });
        }
    }
}

export default UserController;