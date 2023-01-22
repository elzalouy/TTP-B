import { Router } from "express";
import TaskReq from "../../presentation/task/task";
import apiRoute from "./apis";
import Multer from "../../middlewares/multer";
import Authed from "../../middlewares/Auth/Authed";
const router = Router();
const multer = Multer();
const {
  CREATE_TASK,
  UPDATE_TASK,
  GET_TASKS,
  FILTER_TASKS,
  MOVE_TASK,
  DELETE_TASKS,
  DELETE_TASKS_BY_PROJECT_ID,
  DELETE_TASK,
  DOWNLOAD_ATTACHMENT,
  EDIT_TASKS_PROJECTID,
  TASKS_CSV,
} = apiRoute;
const {
  handleCreateCard,
  handleUpdateCard,
  handleGetTasks,
  handleFilterTasks,
  handleMoveCard,
  handleDeleteTasks,
  handleDeleteTasksByProjectId,
  handleDeleteTask,
  handleDownloadAttachment,
  hanldeEditTasksProjectId,
  handleGetTasksCSV,
} = TaskReq;

router.post(
  CREATE_TASK,
  Authed,
  multer.array("attachedFiles"),
  handleCreateCard
);
router.get(DOWNLOAD_ATTACHMENT, handleDownloadAttachment);
router.post(
  UPDATE_TASK,
  Authed,
  multer.array("attachedFiles"),
  handleUpdateCard
);
router.get(GET_TASKS, Authed, handleGetTasks);
router.post(FILTER_TASKS, Authed, handleFilterTasks);
router.put(MOVE_TASK, Authed, handleMoveCard);
router.put(EDIT_TASKS_PROJECTID, Authed, hanldeEditTasksProjectId);
router.delete(DELETE_TASKS, Authed, handleDeleteTasks);
router.delete(DELETE_TASKS_BY_PROJECT_ID, Authed, handleDeleteTasksByProjectId);
router.delete(DELETE_TASK, Authed, handleDeleteTask);
router.post(TASKS_CSV, Authed, handleGetTasksCSV);
export default router;
