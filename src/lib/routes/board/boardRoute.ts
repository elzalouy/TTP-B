import { Router } from "express";
import BoardReq from "../../presentation/boards/boards";
import apiRoute from "./apis";
import Multer from "../../services/multer";

const multer = Multer();

const router = Router();
const { GET_BOARD_INFO, GET_BOARDS, GET_MEMBERS, ADD_MEMBER, CREATE_LIST } =
  apiRoute;
const {
  handleGetBoards,
  handleGetMembers,
  handleGetBoardInfo,
  handleAddMember,
  handleAddList,
} = BoardReq;

// router.post(
//   "/testCreateAttachment",
//   multer.array("attachedFiles"),
//   handleCreateAttachmentTest
// );
router.get(`${GET_BOARDS}`, handleGetBoards);
router.get(`${GET_BOARD_INFO}`, handleGetBoardInfo);
router.get(`${GET_MEMBERS}`, handleGetMembers);
router.post(`${ADD_MEMBER}`, handleAddMember);
router.post(`${CREATE_LIST}`, handleAddList);

export default router;
