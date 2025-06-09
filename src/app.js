import express, { urlencoded } from "express";
import Rotas from "./routes/index.js";
import compression from "compression";
import helmet from "helmet";
import DbConnect from "./config/DbConnect.js";
import requestLogger from "./middleware/requestLogger.js";
import Logger from "./utils/helpers/logger.js";

const app = express();

await DbConnect.conectar();

app.use(helmet());
app.use(compression());
app.use(requestLogger);  // Adicionar antes do parsing de body
app.use(express.json());
app.use(urlencoded({ extended: true }));

Rotas(app);

// Middleware de tratamento de erros aprimorado
app.use((err, req, res, next) => {
  const idRequisicao = req.idRequisicao || 'desconhecido';
  
  Logger.error(`[${idRequisicao}] Erro na requisição ${req.method} ${req.originalUrl}`, {
    erro: err.message,
    stack: err.stack,
    nome: err.name,
    status: err.status || 500
  });

  // Erros de validação Zod
  if (err.name === 'ValidationError') {
    return res.status(err.status || 400).json({
      mensagem: err.message,
      detalhes: err.details || err.errors
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      mensagem: err.message,
      detalhes: err.details
    });
  }

  res.status(500).json({
    mensagem: err.message || "Erro interno do servidor"
  });
});

export default app;