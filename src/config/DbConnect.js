import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

class DbConnect {
    static async conectar() {
        try {
            const mongoURI = process.env.DB_URL;

            if (!mongoURI) {
                throw new Error("A URL do banco de dados não está definida no arquivo .env")
            }

            await mongoose.connect(mongoURI);

            mongoose.connection.on('connected', () => {
                console.log('Conectado ao MongoDB');
            })

            mongoose.connection.on('error', (erro) => {
                console.error('Erro ao conectar ao MongoDB:', erro);
            });

            mongoose.connection.on('disconnected', () => {
                console.log('Desconectado do MongoDB');
            });
        } catch (erro) {
            throw new Error(`Erro ao conectar ao banco de dados: ${erro.message}`);
        }
    }

    static async desconectar() {
        try {
            await mongoose.disconnect();
            console.log('Conexão com o MongoDB encerrada');
        } catch (erro) {
            throw new Error(`Erro ao desconectar do banco de dados: ${erro.message}`);
        }
    }
}

export default DbConnect;