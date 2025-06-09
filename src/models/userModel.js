import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class User {
    constructor() {
        const userSchema = new mongoose.Schema(
            {
                nome: {
                    type: String,
                    required: true
                },
                apelido: {
                    type: String,
                    required: true,
                    unique: true
                },
                email: {
                    type: String,
                    required: true,
                    unique: true,
                    
                },
                senha: {
                    type: String,
                    required: true,
                    select: false
                },
                respostaSeguranca: {
                    type: String,
                    required: true,
                    select: false
                },
                status: {
                    type: String,
                    required: true,
                    enum: ['Ativo', 'Inativo', 'Banido']
                }
            },
            {
                timestamps: { createdAt: 'data_criacao', updatedAt: 'data_ultimo_login' },
                versionKey: false
            }
        )

        userSchema.index({data_criacao: -1});
        userSchema.index({data_ultimo_login: -1})
        
        userSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuario', userSchema);
    }
}

export default new User().model;