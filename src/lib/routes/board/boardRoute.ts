import { Router } from "express";
import Trello from "../../presentation/trello/trello";
import apiRoute from "./apis";
import Multer from "../../middlewares/multer";
import TrelloHooks from "../../presentation/trello/trelloHooks";
import Authed from "../../middlewares/Auth/Authed";
import OMOrSM from "../../middlewares/Auth/OMOrSM";

const multer = Multer();

const router = Router();
const {
  GET_BOARD_INFO,
  GET_BOARDS,
  GET_MEMBERS,
  ADD_MEMBER,
  CREATE_LIST,
  WEBHOOK_UPDATES,
  WEBHOOK_UPDATES_PROJECT,
  POST_BACKUP_FROM_TRELLO,
  RESTORE_TASKS_ON_TRELLO,
} = apiRoute;
const {
  handleGetBoards,
  handleGetMembers,
  handleGetBoardInfo,
  handleAddMember,
  handleAddList,
  postSnapshotOfActionsFromTrello,
  restoreNotExistedOnTrello,
} = Trello;
const { handleWebhookUpdateCard, handleWebHookUpdateProject } = TrelloHooks;
router.get(`${GET_BOARDS}`, handleGetBoards);
router.get(`${GET_BOARD_INFO}`, handleGetBoardInfo);
router.get(`${GET_MEMBERS}`, handleGetMembers);
router.post(`${ADD_MEMBER}`, handleAddMember);
router.post(`${CREATE_LIST}`, handleAddList);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES_PROJECT}`, handleWebHookUpdateProject);
router.post(`${WEBHOOK_UPDATES_PROJECT}`, handleWebHookUpdateProject);
router.post(
  POST_BACKUP_FROM_TRELLO,
  Authed,
  OMOrSM,
  postSnapshotOfActionsFromTrello
);
router.post(RESTORE_TASKS_ON_TRELLO, Authed, OMOrSM, restoreNotExistedOnTrello);

export default router;
