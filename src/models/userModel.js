import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

class User {
    constructor() {
        const userSchema = new mongoose.Schema(
            {
                name: {
                    type: String,
                    required: true
                },
                nickname: {
                    type: String,
                    required: true,
                    unique: true
                },
                email: {
                    type: String,
                    required: true,
                    unique: true,
                    
                },
                password: {
                    type: String,
                    required: true,
                    select: false
                },
            },
            {
                timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
                versionKey: false
            }
        );
        
        userSchema.plugin(mongoosePaginate);
        this.model = mongoose.model('usuario', userSchema);
    }
}

export default new User().model;