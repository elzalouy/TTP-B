"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apis_1 = __importDefault(require("./apis"));
const express_1 = require("express");
const notification_1 = __importDefault(require("../../presentation/notification/notification"));
const router = (0, express_1.Router)();
const { GET_ALL_NOTIFIS, DELETE_NOTIFI, UPDATE_NOTIFI, CREATE_NOTIFI } = apis_1.default;
const { handleCreateNotification, handleUpdateNotification, handleDeleteNotification, handleGetAllNotifications, } = notification_1.default;
router.post(`${CREATE_NOTIFI}`, handleCreateNotification);
router.put(`${UPDATE_NOTIFI}`, handleUpdateNotification);
router.delete(`${DELETE_NOTIFI}`, handleDeleteNotification);
router.get(`${GET_ALL_NOTIFIS}`, handleGetAllNotifications);
exports.default = router;
