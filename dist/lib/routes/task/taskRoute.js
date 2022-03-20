"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_1 = __importDefault(require("../../presentation/task/task"));
const apis_1 = __importDefault(require("./apis"));
const multer_1 = __importDefault(require("multer"));
let upload = (0, multer_1.default)();
const router = (0, express_1.Router)();
const { CREATE_TASK, UPDATE_TASK, WEBHOOK_UPDATES } = apis_1.default;
const { handleCreateCard, handleUpdateCard, handleWebhookUpdateCard } = task_1.default;
router.post(`${CREATE_TASK}`, upload.single('file'), handleCreateCard);
router.post(`${UPDATE_TASK}`, upload.single('file'), handleUpdateCard);
router.post(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
router.get(`${WEBHOOK_UPDATES}`, handleWebhookUpdateCard);
exports.default = router;
