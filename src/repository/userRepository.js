import userModel from '../models/userModel.js';
import Logger from '../utils/helpers/logger.js';

class UserRepository {
    constructor({ model = userModel } = {}) {
        this.model = model;
        Logger.debug("UserRepository instanciado");
    }

    async cadastrarUsuario(dadosUsuario) {
        Logger.debug("Executando cadastro de usuário no repositório", {
            operacao: 'repository.cadastrarUsuario',
            email: dadosUsuario.email
        });

        const usuario = new this.model(dadosUsuario);
        return await usuario.save();
    }

    async editarUsuario(id, dadosUsuario) {
        Logger.debug("Executando edição de usuário no repositório", {
            operacao: 'repository.editarUsuario',
            id
        });

        const usuarioExiste = await this.model.findById(id);
        if(!usuarioExiste) {
            Logger.debug(`Usuário com ID ${id} não encontrado para edição`);
            return null;
        }

        const usuarioAtualizado = await this.model.findByIdAndUpdate(id,
            {$set: dadosUsuario},
            {
                new: true,
                runValidators: true,
            }
        );
        return usuarioAtualizado;
    }

    async deletarUsuario(id) {
        Logger.debug("Executando deleção de usuário no repositório",
            {
                operacao: 'repository.deletarUsuario',
                id
            }
        )

        const usuarioExiste = await this.model.findById(id);
        if(!usuarioExiste) {
            Logger.debug(`Usuário com ID ${id} não encontrado para deleção`);
            return null;
        }

        const usuarioDeletado = await this.model.findByIdAndDelete(id);
        Logger.debug(`Usuário com ID ${id} deletado com sucesso`);
        return usuarioDeletado;
        
    }
}

export default UserRepository;