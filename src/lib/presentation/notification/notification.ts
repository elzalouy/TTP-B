import { NotificationData } from "../../types/model/Notification";
import { successMsg } from "../../utils/successMsg";
import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import NotificationController from "../../controllers/notification";
import { ObjectId } from "mongodb";

const NotificationReq = class NotificationReq extends NotificationController {
  static async handleCreateNotification(req: Request, res: Response) {
    try {
      let Notification = await super.createNotification(req.body);
      if (Notification) {
        return res.status(200).send(Notification);
      } else {
        return res.status(400).send(customeError("create_notifi_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateNotificationDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateNotification(req: Request, res: Response) {
    try {
      let notificationData: NotificationData = req.body;
      logger.info({notificationData})
      if (!notificationData) {
        return res.status(400).send(customeError("update_notifi_error", 400));
      }
      let Notification
      if(notificationData.role === 'PM' ){

        Notification = await super.updateNotification({projectManagerID:new ObjectId(notificationData._id)},{projectManagerViewed:true});
      } 

      if(notificationData.role === 'OM'){
        Notification = await super.updateNotification({adminUserID:new ObjectId(notificationData._id)},{adminViewed:true});
      }
      logger.info({Notification})

      if (Notification) {
        return res.status(200).send(Notification);
      } else {
        return res.status(400).send(customeError("update_notifi_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateNotificationDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteNotification(req: Request, res: Response) {
    try {
      let id: any = req.query.id;
      if (!id) {
        return res.status(400).send(customeError("delete_notifi_error", 400));
      }

      let Notification = await super.deleteNotification(id);
      if (Notification) {
        return res.status(200).send(successMsg("delete_notifi_success", 200));
      } else {
        return res.status(400).send(customeError("delete_notifi_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletNotificationDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetAllNotifications(req: Request, res: Response) {
    try {
      let {id,skip,limit}:any = req.query
      let Notification = await super.getAllNotifications({id,skip,limit});
      if (Notification) {
        return res.status(200).send(Notification);
      } else {
        return res.status(400).send(customeError("get_notifi_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletNotificationDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default NotificationReq;
