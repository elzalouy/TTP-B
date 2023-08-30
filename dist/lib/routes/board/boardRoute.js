"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const trello_1 = __importDefault(require("../../presentation/trello/trello"));
const apis_1 = __importDefault(require("./apis"));
const multer_1 = __importDefault(require("../../middlewares/multer"));
const trelloHooks_1 = __importDefault(require("../../presentation/trello/trelloHooks"));
const multer = (0, multer_1.default)();
const router = (0, express_1.Router)();
const { GET_BOARD_INFO, GET_BOARDS, GET_MEMBERS, ADD_MEMBER, CREATE_LIST, WEBHOOK_UPDATES, WEBHOOK_UPDATES_PROJECT,
// POST_BACKUP_FROM_TRELLO,
// RESTORE_TASKS_ON_TRELLO,
 } = apis_1.default;
const { handleGetBoards, handleGetMembers, handleGetBoardInfo, handleAddMember, handleAddList, postSnapshotOfActionsFromTrello, restoreNotExistedOnTrello, } = trello_1.default;
const { handleWebhookUpdateCard, handleWebHookUpdateProject } = trelloHooks_1.default;
router.get(`${GET_BOARDS}`, handleGetBoards);
router.get(`${GET_BOARD_INFO}`, handleGetBoardInfo);
router.get(`${GET_MEMBERS}`, handleGetMembers);
router.post(`${ADD_MEMBER}`, handleAddMember);
router.post(`${CREATE_LIST}`, handleAddList);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES_PROJECT}`, handleWebHookUpdateProject);
router.post(`${WEBHOOK_UPDATES_PROJECT}`, handleWebHookUpdateProject);
// router.post(
//   POST_BACKUP_FROM_TRELLO,
//   Authed,
//   OMOrSM,
//   postSnapshotOfActionsFromTrello
// );
// router.post(RESTORE_TASKS_ON_TRELLO, Authed, OMOrSM, restoreNotExistedOnTrello);
exports.default = router;
