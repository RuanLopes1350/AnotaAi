import express from "express";
import taskRoutes from './taskRoutes.js';

import dotenv from 'dotenv';

dotenv.config();

const rotas = (app) => {
  app.get("/", (req, res) => {
    res.redirect("/login");
  });

  app.use(express.json(),
    taskRoutes
  );

  app.use((req, res) => {
    res.status(404).json(
      {
        message: "Rota não encontrada"
      }
    )
  })
}

export default rotas