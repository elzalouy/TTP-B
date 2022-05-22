"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const successMsg_1 = require("../../utils/successMsg");
const errorUtils_1 = require("../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const notification_1 = __importDefault(require("../../controllers/notification"));
const mongodb_1 = require("mongodb");
const NotificationReq = class NotificationReq extends notification_1.default {
    static handleCreateNotification(req, res) {
        const _super = Object.create(null, {
            createNotification: { get: () => super.createNotification }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let Notification = yield _super.createNotification.call(this, req.body);
                if (Notification) {
                    return res.status(200).send(Notification);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_notifi_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateNotificationDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateNotification(req, res) {
        const _super = Object.create(null, {
            updateNotification: { get: () => super.updateNotification }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notificationData = req.body;
                logger_1.default.info({ notificationData });
                if (!notificationData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_notifi_error", 400));
                }
                let Notification;
                if (notificationData.role === 'PM') {
                    Notification = yield _super.updateNotification.call(this, { projectManagerID: new mongodb_1.ObjectId(notificationData._id) }, { projectManagerViewed: true });
                }
                if (notificationData.role === 'OM') {
                    Notification = yield _super.updateNotification.call(this, { adminUserID: new mongodb_1.ObjectId(notificationData._id) }, { adminViewed: true });
                }
                logger_1.default.info({ Notification });
                if (Notification) {
                    return res.status(200).send(Notification);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_notifi_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateNotificationDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteNotification(req, res) {
        const _super = Object.create(null, {
            deleteNotification: { get: () => super.deleteNotification }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.query.id;
                if (!id) {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_notifi_error", 400));
                }
                let Notification = yield _super.deleteNotification.call(this, id);
                if (Notification) {
                    return res.status(200).send((0, successMsg_1.successMsg)("delete_notifi_success", 200));
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_notifi_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletNotificationDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetAllNotifications(req, res) {
        const _super = Object.create(null, {
            getAllNotifications: { get: () => super.getAllNotifications }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { id, skip, limit } = req.query;
                let Notification = yield _super.getAllNotifications.call(this, { id, skip, limit });
                if (Notification) {
                    return res.status(200).send(Notification);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_notifi_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletNotificationDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = NotificationReq;
