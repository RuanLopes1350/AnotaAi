import mongoose from "mongoose";

class Tags {
    constructor() {
        const tagsSchema = new mongoose.Schema(
            {
                nome: {
                    type: String,
                    required: true,
                    index: true
                },
                cor: {
                    type: String,
                    default: '#6c757d'
                },
                usuarioId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'usuario',
                    required: true
                }
            },
            {
                timestamps: true
            }
        )

        tagsSchema.index({ nome: 1, usuarioId: 1 }, { unique: true }); // garante que não haja tags duplicadas para o mesmo usuário

        tagsSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('tags', tagsSchema);
    }
}

export default new Tags().model;