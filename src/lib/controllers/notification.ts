import NotificationDB from "../dbCalls/notification/notification";
import { NotificationData } from "./../types/model/Notification";
import logger from "../../logger";

const NotificationController = class NotificationController extends NotificationDB {
  static async createNotification(data: NotificationData) {
    return await NotificationController.__createNotification(data);
  }

  static async updateNotification(data: any, value: object) {
    return await NotificationController.__updateNotification(data, value);
  }

  static async getAllNotifications(data: {
    id: string;
    skip?: string;
    limit?: string;
  }) {
    return await NotificationController.__getAllNotifications(data);
  }
  static async deleteNotification(id: string) {
    return await NotificationController.__deleteNotification(id);
  }

  static async __deleteNotification(id: string) {
    try {
      let notification = await super.deleteNotificationDB(id);
      return notification;
    } catch (error) {
      logger.error({ deletNotificationControllerError: error });
    }
  }

  static async __getAllNotifications(data: {
    id: string;
    skip?: string;
    limit?: string;
  }) {
    try {
      let notification = await super.getAllNotificationsDB(data);
      return notification;
    } catch (error) {
      logger.error({ getNotificationControllerError: error });
    }
  }

  static async __updateNotification(data: any, value: object) {
    try {
      let notification = await super.updateNotificationDB(data, value);
      return notification;
    } catch (error) {
      logger.error({ updateNotificationControllerError: error });
    }
  }

  static async __createNotification(data: NotificationData) {
    try {
      let notification = super.createNotificationDB(data);
      return notification;
    } catch (error) {
      logger.error({ createNotificationError: error });
    }
  }
};

export default NotificationController;
