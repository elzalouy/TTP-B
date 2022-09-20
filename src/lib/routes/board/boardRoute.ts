import { Router } from "express";
import Trello from "../../presentation/trello/trello";
import apiRoute from "./apis";
import Multer from "../../middlewares/multer";

const multer = Multer();

const router = Router();
const {
  GET_BOARD_INFO,
  GET_BOARDS,
  GET_MEMBERS,
  ADD_MEMBER,
  CREATE_LIST,
  WEBHOOK_UPDATES,
} = apiRoute;
const {
  handleGetBoards,
  handleGetMembers,
  handleGetBoardInfo,
  handleAddMember,
  handleAddList,
  handleWebhookUpdateCard,
  handleWebHookUpdateBoard,
} = Trello;

router.get(`${GET_BOARDS}`, handleGetBoards);
router.get(`${GET_BOARD_INFO}`, handleGetBoardInfo);
router.get(`${GET_MEMBERS}`, handleGetMembers);
router.post(`${ADD_MEMBER}`, handleAddMember);
router.post(`${CREATE_LIST}`, handleAddList);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES}/board`, handleWebHookUpdateBoard);
router.post(`${WEBHOOK_UPDATES}/board`, handleWebHookUpdateBoard);
export default router;
