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
exports.removeOldNotifications = void 0;
const cron_1 = require("cron");
const notification_1 = __importDefault(require("../../dbCalls/notification/notification"));
const logger_1 = __importDefault(require("../../../logger"));
const Notification_1 = __importDefault(require("../../models/Notification"));
function removeOldNotifications(io) {
    return new cron_1.CronJob("0 0 31/20 * *", () => __awaiter(this, void 0, void 0, function* () {
        let today = new Date();
        let oldNotifications = yield Notification_1.default.find()
            .where("createdAt")
            .lte(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).getTime())
            .where("isNotified.isNotified")
            .equals(true);
        console.log({ oldNotifications });
        let ids = oldNotifications.map((item) => item._id);
        if (oldNotifications.length > 0) {
            let result = yield notification_1.default.__deleteNotifcations({
                _id: { $in: ids },
            });
            logger_1.default.info({ monthlyDeleteNotifications: result.deletedCount });
        }
    }), null, true, "Asia/Riyadh", null, true);
}
exports.removeOldNotifications = removeOldNotifications;
