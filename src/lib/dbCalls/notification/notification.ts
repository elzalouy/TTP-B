import Notification from "../../models/Notification";
import logger from "../../../logger";
import {
  NotificationInfo,
  NotificationData,
} from "../../types/model/Notification";
import { ObjectID } from "bson";

const NotificationDB = class NotificationDB {
  static async createNotificationDB(data: NotificationData) {
    return await NotificationDB.__createNotification(data);
  }

  static async updateNotificationDB(query:object,value:object) {
    return await NotificationDB.__updateNotification(query,value);
  }

  static async getAllNotificationsDB(data: { id: string }) {
    return await NotificationDB.__getAllNotifications(data);
  }
  static async deleteNotificationDB(id: string) {
    return await NotificationDB.__deleteNotification(id);
  }


  static async __deleteNotification(id: string) {
    try {
      let notification = await Notification.findByIdAndDelete({
        _id: new ObjectID(id),
      });
      return notification;
    } catch (error) {
      logger.error({ deletNotificationDBError: error });
    }
  }

  static async __getAllNotifications(data: { id: string } = { id: "" }) {
    try {
      console.log({ data });
      let notification = await Notification.aggregate([
        {
          $match: {
            $or: [
              { projectManagerID: new ObjectID(data.id) },
              { adminUserID: new ObjectID(data.id) },
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
        { $unwind: { path: '$projectManagerID', "preserveNullAndEmptyArrays": true } },
        { $unwind: { path: '$adminUserID', "preserveNullAndEmptyArrays": true } },
      ]);
      return notification;
    } catch (error) {
      logger.error({ getNotificationDBError: error });
    }
  }

  static async __updateNotification(query:object,value:object) {
    try {

      let notification = await Notification.updateMany(query,value)
      // let notification = await Notification.findByIdAndUpdate(
      //   { _id: new ObjectID(id) },
      //   { ...data },
      //   { new: true }
      // );
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
