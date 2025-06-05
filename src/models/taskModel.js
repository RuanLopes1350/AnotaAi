import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class Task {
    constructor() {
        const taskSchema = new mongoose.Schema(
            {
                titulo: { 
                    type: String, 
                    required: true,
                    index: true
                },
                descricao: { 
                    type: String, 
                    required: true 
                },
                status: { 
                    type: String, 
                    required: true, 
                    enum: ['Pendente', 'Em Progresso', 'Concluída', 'Abandonada', 'Atrasada'],
                    index: true
                },
                // prioridade: { type: String, required: true, enum: ['Baixa', 'Média', 'Alta'] },
                dataLimite: { 
                    type: Date, 
                    required: true,
                    index: true
                },
                dataConclusao: { 
                    type: Date,
                    index: true
                },
                usuario: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'usuario', 
                    required: true
                },
            },
            {
                timestamps: {createdAt: 'data_criacao', updatedAt: 'data_ultima_atualizacao'},
                versionKey: false,
            }
        )
        taskSchema.index({data_criacao: -1});
        taskSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('task', taskSchema);
    }
}

export default new Task().model;