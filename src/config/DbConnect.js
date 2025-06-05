import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Logger from '../utils/helpers/logger.js';

dotenv.config();

class DbConnect {
    static async conectar() {
        const idOperacao = Logger.iniciarOperacao('conexão-db', 'Conectando ao banco de dados');
        
        try {
            const mongoURI = process.env.DB_URL;

            if (!mongoURI) {
                throw new Error("A URL do banco de dados não está definida no arquivo .env")
            }

            await mongoose.connect(mongoURI);

            mongoose.connection.on('connected', () => {
                console.log('Conectado ao MongoDB');
                Logger.info(`[${idOperacao}] Conexão estabelecida com o MongoDB`)
            })

            mongoose.connection.on('error', (erro) => {
                console.error('Erro ao conectar ao MongoDB:', erro);
                Logger.registrarErro(idOperacao, 'conexão-db', erro);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Desconectado do MongoDB');
                Logger.info(`[${idOperacao}] Desconexão do MongoDB`);
            });
            
            Logger.finalizarOperacao(idOperacao, 'conexão-db', 'Conexão estabelecida com sucesso');
            
        } catch (erro) {
            Logger.registrarErro(idOperacao, 'conexão-db', erro);
            throw new Error(`Erro ao conectar ao banco de dados: ${erro.message}`);
        }
    }

    static async desconectar() {
        const idOperacao = Logger.iniciarOperacao('desconexão-db', 'Desconectando do banco de dados');
        
        try {
            await mongoose.disconnect();
            console.log('Conexão com o MongoDB encerrada');
            Logger.finalizarOperacao(idOperacao, 'desconexão-db', 'Conexão com o MongoDB encerrada com sucesso');
        } catch (erro) {
            Logger.registrarErro(idOperacao, 'desconexão-db', erro);
            throw new Error(`Erro ao desconectar do banco de dados: ${erro.message}`);
        }
    }
}

export default DbConnect;