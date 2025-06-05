import mongoose from "mongoose";
import Task from "../models/taskModel.js";

class TaskRepository {
    constructor({ model = Task } = {}) {
        this.model = model;
    }

    async cadastrarTarefa(dadosTarefa) {
        console.log("Estou em cadastrar tarefa de TaskRepository");
        const tarefa = new this.model(dadosTarefa);
        return await tarefa.save();
    }

    async editarTarefa(id, dadosTarefa) {
        console.log("Estou em editar tarefa de TaskRepository");
        const tarefaExiste = await this.model.findById(id);
        if (!tarefaExiste) {
            return null;
        }

        const tarefaAtualizada = await this.model.findByIdAndUpdate(
            id,
            { $set: dadosTarefa },
            {
                new: true,
                runValidators: true,
            }
        )
        return tarefaAtualizada;
    }

    async listarTarefas(filtros = {}, opcoes = { page: 1, limit: 10 }) {
        const dados = await this.model.paginate(filtros, opcoes);
        return dados;
    }

    async buscarTarefaPorTitulo(titulo) {
        console.log("Estou em buscar tarefa por titulo de TaskRepository");
        const dados = await this.model.findOne({ titulo });
        return dados;
    }

    async buscarTarefaPorStatus(status) {
        console.log("Estou em buscar tarefa por status de TaskRepository");
        const dados = await this.model.find({ status });
        return dados;
    }

    async buscarTarefaPorDataLimite(dataLimite) {
        console.log("Estou em buscar tarefa por data limite de TaskRepository");
        const dados = await this.model.find({ dataLimite });
        return dados;
    }

    async deletarTarefa(id) {
        console.log("Estou em deletar tarefa de TaskRepository");
        const tarefaExiste = await this.model.findById(id);
        if (!tarefaExiste) {
            return null
        }

        const tarefaDeletada = await this.model.findByIdAndDelete(id);
        return tarefaDeletada;
    }
}

export default TaskRepository;