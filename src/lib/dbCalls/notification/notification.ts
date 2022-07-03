import Notification from "../../models/Notification";
import logger from "../../../logger";
import {
  NotificationInfo,
  NotificationData,
} from "../../types/model/Notification";
import { ObjectID } from "bson";

const NotificationDB = class NotificationDB {
  static async __sendNotificationsDB({
    userId,
    current,
    limit,
  }: {
    userId: string;
    current: number;
    limit: number;
  }) {
    try {
      let length = await Notification.count({
        "isNotified.userId": userId,
      });
      console.log(length);
      let notifications = await Notification.find(
        {
          "isNotified.userId": userId,
        },
        "_id title description isNotified createdAt",
        { sort: { createdAt: -1 }, skip: current * limit, limit: limit }
      );
      return {
        notifications: notifications,
        pages: Math.floor(length / limit),
        current: current,
        limit: limit,
      };
    } catch (error) {
      logger.error({ __sendNotificationsDBError: error });
    }
  }
  static async __createNotification(data: NotificationData) {
    try {
      let notification = new Notification(data);
      let result = await notification.save();
      return result;
    } catch (error) {
      logger.error({ __createNotificationsDBError: error });
    }
  }
  static async __getUnotified(userId: string) {
    try {
      let notifications = await Notification.count({
        isNotified: { $elemMatch: { userId: userId, isNotified: false } },
      });
      console.log(notifications);
      return { NoOfUnNotified: notifications };
    } catch (error) {
      logger.error({ __createNotificationsDBError: error });
    }
  }
  static async __updateUnotifiedDB(userId: string) {
    try {
      let update = await Notification.updateMany(
        { isNotified: { $elemMatch: { userId: userId, isNotified: false } } },
        { $set: { "isNotified.$.isNotified": true } }
      );
      if (update.matchedCount) {
        return { NoOfUnNotified: 0 };
      }
      return null;
    } catch (error) {
      logger.error({ __createNotificationsDBError: error });
    }
  }
};

export default NotificationDB;
