import { Router } from "express";
import TaskReq from "../../presentation/task/task";
import apiRoute from "./apis";
import Multer from "../../services/multer";
import Authed from "../../middlewares/Auth/Authed";
const router = Router();
const multer = Multer();
const {
  CREATE_TASK,
  UPDATE_TASK,
  WEBHOOK_UPDATES,
  GET_TASKS,
  FILTER_TASKS,
  MOVE_TASK,
  DELETE_TASKS,
  DELETE_TASKS_BY_PROJECT_ID,
  DELETE_TASK,
  GET_TASKS_STATISTICS,
  GET_ALL_TASKS_STATISTICS,
} = apiRoute;
const {
  handleCreateCard,
  handleUpdateCard,
  handleWebhookUpdateCard,
  handleGetTasks,
  handleFilterTasks,
  handleMoveCard,
  handleDeleteTasks,
  handleDeleteTasksByProjectId,
  handleDeleteTask,
} = TaskReq;

router.post(
  `${CREATE_TASK}`,
  Authed,
  multer.array("attachedFiles"),
  handleCreateCard
);
router.post(`${UPDATE_TASK}`, multer.single("attachedFiles"), handleUpdateCard);
router.put(`${MOVE_TASK}`, Authed, handleMoveCard);
router.post(`${WEBHOOK_UPDATES}`, Authed, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES}`, Authed, handleWebhookUpdateCard);
router.get(`${GET_TASKS}`, Authed, handleGetTasks);
router.post(`${FILTER_TASKS}`, Authed, handleFilterTasks);
router.delete(`${DELETE_TASKS}`, Authed, handleDeleteTasks);
router.delete(
  `${DELETE_TASKS_BY_PROJECT_ID}`,
  Authed,
  handleDeleteTasksByProjectId
);
router.delete(`${DELETE_TASK}`, Authed, handleDeleteTask);
export default router;
