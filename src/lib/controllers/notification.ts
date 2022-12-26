import NotificationDB from "../dbCalls/notification/notification";
import {
  NotificationData,
  NotificationInfo,
} from "./../types/model/Notification";
import logger from "../../logger";
import Project from "../models/Project";
import User from "../models/User";
import { io } from "../..";
import { socketPMs, socketOM } from "../startup/socket";
import { ProjectData } from "../types/model/Project";

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

  static async __MoveTaskFromBoardNotification(data: any, status: string) {
    try {
      // get Notified users
      let project = await Project.findOne({ _id: data.projectId });
      // create notificaton
      let newNotification: NotificationData = {
        title: `${data.name} has been moved to ${status}`,
        description: `${data.name} status has been changed to ${status}`,
        isNotified: [{ userId: project.projectManager, isNotified: false }],
      };
      await super.__createNotification(newNotification);
      // send to current socket clients an update
      // PM
      let PMid = socketPMs.find(
        (item) => item.id === project.projectManager.toString()
      );
      io.to(PMid.socketId).emit("notification-update");
    } catch (error) {
      logger.error({ __MoveTaskNotificationError: error });
    }
  }

  static async __MoveTaskNotification(data: any, status: string, user: any) {
    try {
      // get Notified users
      let id = user.id;
      let project = await Project.findOne({ _id: data.projectId });
      // create notificaton
      if (project.projectManager.toString() !== id) {
        let newNotification: NotificationData = {
          title: `${data.name} has been moved to ${status}`,
          description: `${data.name} status has been changed to ${status}`,
          isNotified: [{ userId: project.projectManager, isNotified: false }],
        };
        await super.__createNotification(newNotification);
        // send to current socket clients an update
        // PM
        let PMid = socketPMs
          .filter((item) => item.id === project.projectManager.toString())
          .map((item) => item.socketId);
        if (PMid && project.projectManager !== id)
          io.to(PMid).emit("notification-update");
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
    // to the PM if not the current user, and admins except the current user
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
          let pm = socketPMs
            .filter((item) => item.id === data.projectManager)
            .map((item) => item.socketId);
          if (userId !== data.projectManager)
            io.to(pm).emit("notification-update");
        }
        let OMS = await (
          await User.find({ role: "OM" }).select("_id").lean()
        ).map((item) => {
          return { userId: item._id.toString(), isNotified: false };
        });

        let users = OMS.filter((item) => item.userId !== userId);
        let notification = await super.__createNotification({
          title: `${data.name} project status changed to done`,
          description: `${data.name} project status changed to done`,
          isNotified: users,
        });
        let oms = socketOM
          .filter((item) => item.id !== userId)
          .map((item) => item.socketId);
        if (data.adminId.toString() !== userId)
          io.to(oms).emit("notification-update");
      }
    } catch (error) {
      logger.error({ __updateProjectNotificationError: error });
    }
  }

  static async __creatProjectNotification(data: ProjectData, userId: string) {
    // to the PM if not created by him, and other admins without the userId
    try {
      let user = await User.findById(userId);
      if (userId !== data.projectManager) {
        await super.__createNotification({
          title: `${data.name} has been assigned to you`,
          description: `${data.name} has assigned to you by ${user.name}`,
          isNotified: [{ userId: data.projectManager, isNotified: false }],
        });
        let pm = socketPMs
          .filter((item) => item.id === data.projectManager)
          .map((item) => item.socketId);
        if (userId !== data.projectManager)
          io.to(pm).emit("notification-update");
      }
      let OMS = await (
        await User.find({ role: "OM" }).select("_id").lean()
      ).map((item) => {
        return { userId: item._id.toString(), isNotified: false };
      });
      let OMusers = OMS.filter((item) => item.userId !== userId);
      let notification = await super.__createNotification({
        title: `${data.name} has started`,
        description: `${data.name} has created by ${user.name}`,
        isNotified: OMusers,
      });
      let oms = socketOM
        .filter((item) => item.id !== userId)
        .map((item) => item.socketId);
      io.to(oms).emit("notification-update");
    } catch (error) {
      logger.error({ __updateProjectNotificationError: error });
    }
  }

  // static async createNotification(data: NotificationData){
  //   try {
  //     await
  //   } catch (error) {
  //   }
  // }
};

export default NotificationController;
