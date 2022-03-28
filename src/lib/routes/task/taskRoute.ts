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
} = apiRoute;
const {
  handleCreateCard,
  handleUpdateCard,
  handleWebhookUpdateCard,
  handleGetTasks,
  handleFilterTasks,
  handleMoveCard,
} = TaskReq;

router.post(`${CREATE_TASK}`, upload.single("file"), handleCreateCard);
router.post(`${UPDATE_TASK}`, upload.single("file"), handleUpdateCard);
router.post(`${MOVE_TASK}`, handleMoveCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${GET_TASKS}`, handleGetTasks);
router.post(`${FILTER_TASKS}`, handleFilterTasks);
export default router;
