import Task from "../models/taskModel.js";
import Logger from '../utils/helpers/logger.js';

class TaskRepository {
    constructor({ model = Task } = {}) {
        this.model = model;
        Logger.debug("TaskRepository instanciado");
    }

    async cadastrarTarefa(dadosTarefa) {
        Logger.debug("Executando cadastro de tarefa no repositório", { 
            operacao: 'repository.cadastrarTarefa',
            titulo: dadosTarefa.titulo
        });
        
        const tarefa = new this.model(dadosTarefa);
        return await tarefa.save();
    }

    async editarTarefa(id, dadosTarefa) {
        Logger.debug("Executando edição de tarefa no repositório", { 
            operacao: 'repository.editarTarefa',
            id
        });
        
        const tarefaExiste = await this.model.findById(id);
        if (!tarefaExiste) {
            Logger.debug(`Tarefa com ID ${id} não encontrada para edição`);
            return null;
        }

        const tarefaAtualizada = await this.model.findByIdAndUpdate(
            id,
            { $set: dadosTarefa },
            {
                new: true,
                runValidators: true,
            }
        );
        return tarefaAtualizada;
    }

    async listarTarefas(filtros = {}, opcoes = { page: 1, limit: 10 }) {
        Logger.debug("Executando listagem de tarefas no repositório", { 
            operacao: 'repository.listarTarefas',
            filtros,
            pagina: opcoes.page,
            limite: opcoes.limit
        });
        
        const dados = await this.model.paginate(filtros, opcoes);
        return dados;
    }

    async buscarTarefaPorTitulo(titulo) {
        Logger.debug("Executando busca de tarefa por título no repositório", { 
            operacao: 'repository.buscarTarefaPorTitulo',
            titulo
        });
        
        const dados = await this.model.findOne({ titulo });
        return dados;
    }

    async buscarTarefaPorStatus(status) {
        Logger.debug("Executando busca de tarefas por status no repositório", { 
            operacao: 'repository.buscarTarefaPorStatus',
            status
        });
        
        const dados = await this.model.find({ status });
        return dados;
    }

    async buscarTarefaPorDataLimite(dataLimite) {
        Logger.debug("Executando busca de tarefas por data limite no repositório", { 
            operacao: 'repository.buscarTarefaPorDataLimite',
            dataLimite: dataLimite instanceof Date ? 
                dataLimite.toLocaleDateString('pt-BR') : dataLimite
        });
        
        const dados = await this.model.find({ dataLimite });
        return dados;
    }

    async deletarTarefa(id) {
        Logger.debug("Executando exclusão de tarefa no repositório", { 
            operacao: 'repository.deletarTarefa',
            id
        });
        
        const tarefaExiste = await this.model.findById(id);
        if (!tarefaExiste) {
            Logger.debug(`Tarefa com ID ${id} não encontrada para exclusão`);
            return null;
        }

        const tarefaDeletada = await this.model.findByIdAndDelete(id);
        return tarefaDeletada;
    }
}

export default TaskRepository;