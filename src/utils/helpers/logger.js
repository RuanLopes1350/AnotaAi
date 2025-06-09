import winston from 'winston';
import path from 'path';
import fs from 'fs';

// Garante que o diretório de logs existe
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define o formato dos logs
const formatoLog = winston.format.combine(
  winston.format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ level, message, timestamp, ...metadata }) => {
    let metadataStr = '';
    if (Object.keys(metadata).length > 0 && metadata.stack !== undefined) {
      metadataStr = `\n${metadata.stack}`;
    } else if (Object.keys(metadata).length > 0) {
      metadataStr = `\n${JSON.stringify(metadata, null, 2)}`;
    }
    return `${timestamp} [${level.toUpperCase()}]: ${message}${metadataStr}`;
  })
);

// Configuração de cores para logs no console
const coresNiveis = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

winston.addColors(coresNiveis);

// Criação do logger
const Logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: formatoLog,
  defaultMeta: { servico: 'api-todo-list' },
  transports: [
    // Sempre log para console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        formatoLog
      )
    }),
    // Logs de erro em arquivo separado
    new winston.transports.File({
      filename: path.join(logDir, 'erro.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
    // Todos os logs
    new winston.transports.File({
      filename: path.join(logDir, 'combinado.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5,
    }),
  ],
  // Não parar a aplicação se houver erro no logger
  exitOnError: false,
});

// Função auxiliar para criar IDs de requisição
const gerarIdRequisicao = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Métodos de conveniência para logging contextual
Logger.iniciarOperacao = (operacao, mensagem, dados = {}) => {
  const idRequisicao = gerarIdRequisicao();
  Logger.info(`[${idRequisicao}] Iniciando ${operacao}: ${mensagem}`, {
    idRequisicao,
    operacao,
    ...dados
  });
  return idRequisicao;
};

Logger.finalizarOperacao = (idRequisicao, operacao, mensagem, dados = {}) => {
  Logger.info(`[${idRequisicao}] Finalizando ${operacao}: ${mensagem}`, {
    idRequisicao,
    operacao,
    ...dados
  });
};

Logger.registrarErro = (idRequisicao, operacao, erro, dados = {}) => {
  Logger.error(`[${idRequisicao}] Erro em ${operacao}: ${erro.message}`, {
    idRequisicao,
    operacao,
    erro: {
      mensagem: erro.message,
      stack: erro.stack,
      nome: erro.name,
      codigo: erro.status || 500
    },
    ...dados
  });
};

export default Logger;