import NotificationDB from "../dbCalls/notification/notification";
import { IsNotified, NotificationData } from "./../types/model/Notification";
import logger from "../../logger";
import { TaskData, TaskInfo } from "../types/model/tasks";
import Project from "../models/Project";
import User from "../models/User";
import { io } from "../..";
import { socketClients, socketOM } from "../startup/socket";
import { ProjectData } from "../types/model/Project";
import UserDB from "../dbCalls/user/user";

const NotificationController = class NotificationController extends NotificationDB {
  static async __sendNotifications(
    userId: string,
    current: number,
    limit: number
  ) {
    try {
      let notifications = await super.__sendNotificationsDB({
        userId,
        current,
        limit,
      });
      if (notifications) return notifications;
    } catch (error) {
      logger.error({ __sendNotificationsError: error });
    }
  }

  static async __MoveTaskNotification(data: any, status: string, user: any) {
    try {
      // get Notified users
      let id = user.id;
      let project = await Project.findOne({ _id: data.projectId });

      // create notificaton
      if (project.projectManager !== id) {
        let newNotification: NotificationData = {
          title: `${data.name} has been moved to ${status}`,
          description: `${data.name} status has been changed to ${status}`,
          isNotified: [{ userId: project.projectManager, isNotified: false }],
        };
        await super.__createNotification(newNotification);
        // send to current socket clients an update
        // PM
        let PMid = socketClients.find(
          (item) => item.id === project.projectManager.toString()
        );
        if (PMid && project.projectManager !== id)
          io.to(PMid.socketId).emit("notification-update");
      }
    } catch (error) {
      logger.error({ __MoveTaskNotificationError: error });
    }
  }

  static async __getUnNotified(userId: string) {
    try {
      let unNotified = await super.__getUnotified(userId);
      return unNotified;
    } catch (error) {
      logger.error({ __getUnNotifiedError: error });
    }
  }

  static async __updateUnotified(userId: string) {
    try {
      let updateUnNotified = await super.__updateUnotifiedDB(userId);
      return updateUnNotified;
    } catch (error) {
      logger.error({ __updateUnotifiedError: error });
    }
  }

  static async __updateProjectNotification(data: ProjectData, userId: string) {
    try {
      if (
        data.projectStatus &&
        ["deliver on time", "deliver before deadline", "late"].includes(
          data.projectStatus
        )
      ) {
        if (data.projectManager !== userId) {
          let notification = await super.__createNotification({
            title: `${data.name} project is done ! congratulations`,
            description: `${data.name} project is done. Thank you for your hard work.`,
            isNotified: [{ userId: data.projectManager, isNotified: false }],
          });
          let pm = socketClients.find(
            (item) => item.id === data.projectManager
          );
          if (userId !== data.projectManager)
            io.to(pm.socketId).emit("notification-update");
        }
        if (data.adminId.toString() !== userId) {
          let notification = await super.__createNotification({
            title: `${data.name} project status changed to done`,
            description: `${data.name} project status changed to done`,
            isNotified: [
              { userId: data.adminId.toString(), isNotified: false },
            ],
          });
        }
        // PM
        let admin = socketOM.find(
          (item) => item.id === data.adminId.toString()
        );
        if (data.adminId.toString() !== userId)
          io.to(admin.socketId).emit("notification-update");
      }
    } catch (error) {
      logger.error({ __updateProjectNotificationError: error });
    }
  }
  static async __creatProjectNotification(data: ProjectData, userId: string) {
    try {
      let user = await User.findById(userId);
      if (userId !== data.adminId.toString()) {
        let notification = await super.__createNotification({
          title: `${data.name} has started`,
          description: `${data.name} has created by ${user.name}`,
          isNotified: [{ userId: data.adminId.toString(), isNotified: false }],
        });
        let admin = socketOM.find(
          (item) => item.id === data.adminId.toString()
        );
        io.to(admin.socketId).emit("notification-update");
      }
      if (userId !== data.projectManager) {
        let PmNotification = await super.__createNotification({
          title: `${data.name} has been assigned to you`,
          description: `${data.name} has assigned to you by ${user.name}`,
          isNotified: [{ userId: data.projectManager, isNotified: false }],
        });
        let pm = socketClients.find((item) => item.id === data.projectManager);
        if (userId !== data.projectManager)
          io.to(pm.socketId).emit("notification-update");
      }
    } catch (error) {
      logger.error({ __updateProjectNotificationError: error });
    }
  }
};

export default NotificationController;
