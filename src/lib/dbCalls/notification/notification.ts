import Notification from "../../models/Notification";
import logger from "../../../logger";
import {
  NotificationInfo,
  NotificationData,
} from "../../types/model/Notification";

const NotificationDB = class NotificationDB {
  static async createNotificationDB(data: NotificationData) {
    return await NotificationDB.__createNotification(data);
  }

  static async updateNotificationDB(data: NotificationData) {
    return await NotificationDB.__updateNotification(data);
  }

  static async getAllNotificationsDB(data:object) {
    return await NotificationDB.__getAllNotifications(data);
  }
  static async deleteNotificationDB(id: string) {
    return await NotificationDB.__deleteNotification(id);
  }

  static async __deleteNotification(id: string) {
    try {
      let notification = await Notification.findByIdAndDelete({ _id: id });
      return notification;
    } catch (error) {
      logger.error({ deletNotificationDBError: error });
    }
  }

  static async __getAllNotifications(data:object={}) {
    try {
      let notification = await Notification.find(data).lean();
      return notification;
    } catch (error) {
      logger.error({ getNotificationDBError: error });
    }
  }

  static async __updateNotification(data: NotificationData) {
    try {
      let id = data._id;
      delete data._id;
      let notification = await Notification.findByIdAndUpdate(
        { _id: id },
        { ...data },
        { new: true }
      );
      return notification;
    } catch (error) {
      logger.error({ updateNotificationDBError: error });
    }
  }

  static async __createNotification(data: NotificationData) {
    try {
      let notification: NotificationInfo = new Notification(data);
      await notification.save();
      return notification;
    } catch (error) {
      logger.error({ createNotificationDBError: error });
    }
  }
};

export default NotificationDB;
