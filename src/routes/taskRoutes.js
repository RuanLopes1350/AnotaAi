import express from "express";
import TaskController from "../controller/taskController.js";
import asyncWrapper from "../middleware/asyncWrapper.js";

const router = express.Router();

const taskController = new TaskController();

router.post('/tasks', asyncWrapper(taskController.cadastrarTarefa.bind(taskController)));
router.patch('/tasks/:id', asyncWrapper(taskController.editarTarefa.bind(taskController)));
router.get('/tasks', asyncWrapper(taskController.listarTarefas.bind(taskController)));
router.get('/tasks/titulo/:titulo', asyncWrapper(taskController.buscarTarefaPorTitulo.bind(taskController)));
router.get('/tasks/status/:status', asyncWrapper(taskController.buscarTarefaPorStatus.bind(taskController)));
router.delete('/tasks/:id', asyncWrapper(taskController.deletarTarefa.bind(taskController)));

export default router;