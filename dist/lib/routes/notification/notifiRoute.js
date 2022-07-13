"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apis_1 = __importDefault(require("./apis"));
const express_1 = require("express");
const notification_1 = __importDefault(require("../../presentation/notification/notification"));
const Authed_1 = __importDefault(require("../../middlewares/Auth/Authed"));
const router = (0, express_1.Router)();
const { SEND_NOTIFICATIONS, UPDATE_NOTIFIED, GET_UNNOTIFIED } = apis_1.default;
const { sendNotifications, updateNotified, getUnNotified } = notification_1.default;
router.get(SEND_NOTIFICATIONS, Authed_1.default, sendNotifications);
router.put(UPDATE_NOTIFIED, Authed_1.default, updateNotified);
router.get(GET_UNNOTIFIED, Authed_1.default, getUnNotified);
exports.default = router;
