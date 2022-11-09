import { Router } from "express";
import Trello from "../../presentation/trello/trello";
import apiRoute from "./apis";
import Multer from "../../middlewares/multer";
import TrelloHooks from "../../presentation/trello/trelloHooks";

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
} = apiRoute;
const {
  handleGetBoards,
  handleGetMembers,
  handleGetBoardInfo,
  handleAddMember,
  handleAddList,
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
export default router;
