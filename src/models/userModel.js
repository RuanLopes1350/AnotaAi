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
            },
            {
                timestamps: { createdAt: 'data_criacao', updatedAt: 'data_ultima_atualizacao' },
                versionKey: false
            }
        );
        
        userSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuario', userSchema);
    }
}

export default new User().model;