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
const Notification_1 = __importDefault(require("../../models/Notification"));
const logger_1 = __importDefault(require("../../../logger"));
const NotificationDB = class NotificationDB {
    static __sendNotificationsDB({ userId, current, limit, }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let length = yield Notification_1.default.count({
                    "isNotified.userId": userId,
                });
                console.log(length);
                let notifications = yield Notification_1.default.find({
                    "isNotified.userId": userId,
                }, "_id title description isNotified createdAt", { sort: { createdAt: -1 }, skip: current * limit, limit: limit });
                return {
                    notifications: notifications,
                    pages: Math.floor(length / limit),
                    current: current,
                    limit: limit,
                };
            }
            catch (error) {
                logger_1.default.error({ __sendNotificationsDBError: error });
            }
        });
    }
    static __createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = new Notification_1.default(data);
                let result = yield notification.save();
                return result;
            }
            catch (error) {
                logger_1.default.error({ __createNotificationsDBError: error });
            }
        });
    }
    static __getUnotified(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notifications = yield Notification_1.default.count({
                    isNotified: { $elemMatch: { userId: userId, isNotified: false } },
                });
                console.log(notifications);
                return { NoOfUnNotified: notifications };
            }
            catch (error) {
                logger_1.default.error({ __createNotificationsDBError: error });
            }
        });
    }
    static __updateUnotifiedDB(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let update = yield Notification_1.default.updateMany({ isNotified: { $elemMatch: { userId: userId, isNotified: false } } }, { $set: { "isNotified.$.isNotified": true } });
                if (update.matchedCount) {
                    return { NoOfUnNotified: 0 };
                }
                return null;
            }
            catch (error) {
                logger_1.default.error({ __createNotificationsDBError: error });
            }
        });
    }
};
exports.default = NotificationDB;
