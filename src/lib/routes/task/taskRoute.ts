import { Router } from "express";
import TaskReq from "../../presentation/task/task";
import apiRoute from "./apis";
import multer from "multer";

let upload = multer();

const router = Router();
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

router.post(`${CREATE_TASK}`, upload.single("file"), handleCreateCard);
router.post(`${UPDATE_TASK}`, upload.single("file"), handleUpdateCard);
router.put(`${MOVE_TASK}`, handleMoveCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${GET_TASKS}`, handleGetTasks);
router.post(`${FILTER_TASKS}`, handleFilterTasks);
router.delete(`${DELETE_TASKS}`, handleDeleteTasks);
router.delete(`${DELETE_TASKS_BY_PROJECT_ID}`, handleDeleteTasksByProjectId);
router.delete(`${DELETE_TASK}`, handleDeleteTask);
export default router;
