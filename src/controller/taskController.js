import TaskService from '../service/taskService.js';
import { buildMongoQueryFromParams } from '../utils/validation/queryTaskZodSchema.js';

class TaskController {
    constructor() {
        this.taskService = new TaskService();
    }

    async cadastrarTarefa(req, res) {
        const novaTarefa = await this.taskService.cadastrarTarefa(req.body);
        return res.status(201).json({
            message: 'Tarefa cadastrada com sucesso',
            tarefa: novaTarefa
        });
    }

    async editarTarefa(req, res) {
        try {
            const { id } = req.params;

            const tarefaAtualizada = await this.taskService.editarTarefa(id, req.body);

            if (!tarefaAtualizada) {
                return res.status(404).json({
                    message: 'Tarefa não encontrada'
                });
            }

            return res.status(200).json({
                message: 'Tarefa atualizada com sucesso',
                tarefa: tarefaAtualizada
            });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao atualizar tarefa',
                details: erro.details || erro.message
            });
        }
    }

    async listarTarefas(req, res) {
        const { filter, options } = buildMongoQueryFromParams(req.query);
        const tarefas = await this.taskService.listarTarefas(filter, options);

        return res.status(200).json({
            tarefas: tarefas,
        });
    }

    async buscarTarefaPorTitulo(req, res) {
        try {
            const { titulo } = req.params;
            const tarefa = await this.taskService.buscarTarefaPorTitulo(titulo);

            return res.status(200).json(tarefa);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao buscar tarefa',
                details: erro.details || erro.message
            });
        }
    }

    async buscarTarefaPorStatus(req, res) {
        try {
            const { status } = req.params;
            const tarefas = await this.taskService.buscarTarefaPorStatus(status);

            return res.status(200).json(tarefas);
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao buscar tarefas por status',
                details: erro.details || erro.message
            });
        }
    }

    async deletarTarefa(req, res) {
        try {
            const { id } = req.params;
            const tarefaDeletada = await this.taskService.deletarTarefa(id);

            return res.status(200).json({
                message: 'Tarefa deletada com sucesso',
                tarefa: tarefaDeletada
            });
        } catch (erro) {
            return res.status(erro.status || 500).json({
                message: erro.message || 'Erro ao deletar tarefa',
                details: erro.details || erro.message
            });
        }
    }
}

export default TaskController;