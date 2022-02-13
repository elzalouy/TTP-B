"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const boards_1 = __importDefault(require("../../presentation/boards/boards"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { GET_BOARD_INFO, GET_BOARDS, GET_MEMBERS, ADD_MEMBER, CREATE_LIST } = apis_1.default;
const { handleGetBoards, handleGetMembers, handleGetBoardInfo, handleAddMember, handleAddList } = boards_1.default;
router.get(`${GET_BOARDS}`, handleGetBoards);
router.get(`${GET_BOARD_INFO}`, handleGetBoardInfo);
router.get(`${GET_MEMBERS}`, handleGetMembers);
router.post(`${ADD_MEMBER}`, handleAddMember);
router.post(`${CREATE_LIST}`, handleAddList);
exports.default = router;
