import { NotificationData } from "../../types/model/Notification";
import { successMsg } from "../../utils/successMsg";
import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import NotificationController from "../../controllers/notification";
import { ObjectId } from "mongodb";
import { jwtVerify } from "../../services/auth";

const NotificationReq = class NotificationReq extends NotificationController {
  /**
   * sendNotifications
   *
   * A presentation function receive the user request to get his notifications
   * It accepts req from user to get the new notifications.
   * @param req Request from user to get the current page of notifications.
   * @param res Response should be a page of notificationd with NoOfPages, currentPage, NoOfItems (pagination)
   */

  static async sendNotifications(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("Authorization"));
      if (decoded?.user?.id) {
        let notifications = await super.__sendNotifications(
          decoded?.user?.id,
          parseInt(req.params.current),
          parseInt(req.params.limit)
        );
        return res.status(200).send(notifications);
      }
    } catch (error) {
      logger.error({ sendNotificationsError: error });
    }
  }

  /**
   * updateNotified
   *
   * A presentation function accepts the user request to update notifications to the notified status with isNotified=true
   * @param req Request with notifications ids to update
   * @param res Response should be sent to the user with NoOfUnNotified
   */
  static async updateNotified(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("Authorization"));
      if (decoded?.user?.id) {
        let updateUnNotified = await super.__updateUnotified(decoded?.user?.id);
        console.log(updateUnNotified);
        return res.status(200).send(updateUnNotified);
      }
    } catch (error) {
      logger.error({ updateNotifiedUserError: error });
    }
  }

  /**
   * getUnNotified
   *
   * A presentation function reveive the user request to get the number of notifications with inNotified=false.
   *
   * @param req Request with no data except the user token
   * @param res Response should be sent to the user which is NoOfUnNotified = the number of notifications with inNotified=false
   */
  static async getUnNotified(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("Authorization"));
      if (decoded?.user?.id) {
        let notified = await super.__getUnNotified(decoded?.user?.id);
        return res.status(200).send(notified);
      }
    } catch (error) {
      logger.error({ getUnNotifiedError: error });
    }
  }
};

export default NotificationReq;
