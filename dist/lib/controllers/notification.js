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
const notification_1 = __importDefault(require("../dbCalls/notification/notification"));
const logger_1 = __importDefault(require("../../logger"));
const NotificationController = class NotificationController extends notification_1.default {
    static createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationController.__createNotification(data);
        });
    }
    static updateNotification(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationController.__updateNotification(data, value);
        });
    }
    static getAllNotifications(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationController.__getAllNotifications(data);
        });
    }
    static deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationController.__deleteNotification(id);
        });
    }
    static __deleteNotification(id) {
        const _super = Object.create(null, {
            deleteNotificationDB: { get: () => super.deleteNotificationDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = yield _super.deleteNotificationDB.call(this, id);
                return notification;
            }
            catch (error) {
                logger_1.default.error({ deletNotificationControllerError: error });
            }
        });
    }
    static __getAllNotifications(data) {
        const _super = Object.create(null, {
            getAllNotificationsDB: { get: () => super.getAllNotificationsDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = yield _super.getAllNotificationsDB.call(this, data);
                return notification;
            }
            catch (error) {
                logger_1.default.error({ getNotificationControllerError: error });
            }
        });
    }
    static __updateNotification(data, value) {
        const _super = Object.create(null, {
            updateNotificationDB: { get: () => super.updateNotificationDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = yield _super.updateNotificationDB.call(this, data, value);
                return notification;
            }
            catch (error) {
                logger_1.default.error({ updateNotificationControllerError: error });
            }
        });
    }
    static __createNotification(data) {
        const _super = Object.create(null, {
            createNotificationDB: { get: () => super.createNotificationDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = _super.createNotificationDB.call(this, data);
                return notification;
            }
            catch (error) {
                logger_1.default.error({ createNotificationError: error });
            }
        });
    }
};
exports.default = NotificationController;
