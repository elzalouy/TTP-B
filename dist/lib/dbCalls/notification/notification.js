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
const bson_1 = require("bson");
const NotificationDB = class NotificationDB {
    static createNotificationDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationDB.__createNotification(data);
        });
    }
    static updateNotificationDB(query, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationDB.__updateNotification(query, value);
        });
    }
    static getAllNotificationsDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationDB.__getAllNotifications(data);
        });
    }
    static deleteNotificationDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield NotificationDB.__deleteNotification(id);
        });
    }
    static __deleteNotification(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = yield Notification_1.default.findByIdAndDelete({
                    _id: new bson_1.ObjectID(id),
                });
                return notification;
            }
            catch (error) {
                logger_1.default.error({ deletNotificationDBError: error });
            }
        });
    }
    static __getAllNotifications(data = { id: "" }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info({ data });
                let notification = yield Notification_1.default.aggregate([
                    {
                        $match: {
                            $or: [
                                { projectManagerID: new bson_1.ObjectID(data.id) },
                                { adminUserID: new bson_1.ObjectID(data.id) },
                            ],
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "projectManagerID",
                            foreignField: "_id",
                            as: "projectManagerID",
                        },
                    },
                    {
                        $lookup: {
                            from: "users",
                            localField: "adminUserID",
                            foreignField: "_id",
                            as: "adminUserID",
                        },
                    },
                    {
                        $lookup: {
                            from: "projects",
                            localField: "projectID",
                            foreignField: "_id",
                            as: "projectID",
                        },
                    },
                    { $unwind: { path: "$adminUserID", preserveNullAndEmptyArrays: true } },
                    { $unwind: { path: "$projectID", preserveNullAndEmptyArrays: true } },
                    {
                        $unwind: {
                            path: "$projectManagerID",
                            preserveNullAndEmptyArrays: true,
                        },
                    },
                    {
                        $sort: { createdAt: -1 },
                    },
                    {
                        $project: {
                            _id: 1,
                            description: 1,
                            projectManagerID: 1,
                            adminViewed: 1,
                            projectManagerViewed: 1,
                            title: 1,
                            adminUserID: 1,
                            createdAt: 1,
                            projectID: 1
                        },
                    },
                    {
                        $skip: data.skip ? Number(data.skip) : 0,
                    },
                    {
                        $limit: data.limit ? Number(data.limit) : 4,
                    },
                ]);
                return notification;
            }
            catch (error) {
                logger_1.default.error({ getNotificationDBError: error });
            }
        });
    }
    static __updateNotification(query, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log({ query, value });
                let notification = yield Notification_1.default.updateMany(query, value);
                // let notification = await Notification.findByIdAndUpdate(
                //   { _id: new ObjectID(id) },
                //   { ...data },
                //   { new: true }
                // );
                console.log({ notification });
                return notification;
            }
            catch (error) {
                logger_1.default.error({ updateNotificationDBError: error });
            }
        });
    }
    static __createNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let notification = new Notification_1.default(data);
                yield notification.save();
                return notification;
            }
            catch (error) {
                logger_1.default.error({ createNotificationDBError: error });
            }
        });
    }
};
exports.default = NotificationDB;
