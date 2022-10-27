import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CronJob } from "cron";
import NotificationDB from "../../dbCalls/notification/notification";
import { NotificationInfo } from "../../types/model/Notification";
import logger from "../../../logger";
import Notification from "../../models/Notification";
export function removeOldNotifications(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return new CronJob(
    "* * * */20 * *",
    async () => {
      let today = new Date();
      let oldNotifications = await Notification.find()
        .where("createdAt")
        .lte(new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).getTime())
        .where("isNotified.isNotified")
        .equals(true);
      console.log({ oldNotifications });
      let ids = oldNotifications.map((item: NotificationInfo) => item._id);
      if (oldNotifications.length > 0) {
        let result = await NotificationDB.__deleteNotifcations({
          _id: { $in: ids },
        });
        logger.info({ monthlyDeleteNotifications: result.deletedCount });
      }
    },
    null,
    true,
    "Asia/Riyadh",
    null,
    true
  );
}
