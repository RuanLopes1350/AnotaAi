import express, { urlencoded } from "express";
import Rotas from "./routes/index.js";
import compression from "compression";
import helmet from "helmet";
import DbConnect from "./config/DbConnect.js";

const app = express();

await DbConnect.conectar();

app.use(helmet());

app.use(compression());

app.use(express.json());

app.use(urlencoded({ extended: true }));

Rotas(app);

app.use((err, req, res, next) => {

  console.error('Erro:', err);

  // Erros de validação Zod
  if (err.name === 'ValidationError') {
    return res.status(err.status || 400).json({
      message: err.message,
      details: err.details || err.errors
    });
  }

  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
      details: err.details
    });
  }

  res.status(500).json({
    message: err.message || "Erro interno do servidor"
  });
})

export default app;