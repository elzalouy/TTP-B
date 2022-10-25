"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const notification_1 = __importDefault(
  require("../dbCalls/notification/notification")
);
const logger_1 = __importDefault(require("../../logger"));
const Project_1 = __importDefault(require("../models/Project"));
const User_1 = __importDefault(require("../models/User"));
const __1 = require("../..");
const socket_1 = require("../startup/socket");
const NotificationController = class NotificationController extends notification_1.default {
  static __sendNotifications(userId, current, limit) {
    const _super = Object.create(null, {
      __sendNotificationsDB: { get: () => super.__sendNotificationsDB },
    });
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let notifications = yield _super.__sendNotificationsDB.call(this, {
          userId,
          current,
          limit,
        });
        if (notifications) return notifications;
      } catch (error) {
        logger_1.default.error({ __sendNotificationsError: error });
      }
    });
  }
  static __MoveTaskFromBoardNotification(data, status) {
    const _super = Object.create(null, {
      __createNotification: { get: () => super.__createNotification },
    });
    return __awaiter(this, void 0, void 0, function* () {
      try {
        // get Notified users
        let project = yield Project_1.default.findOne({ _id: data.projectId });
        // create notificaton
        let newNotification = {
          title: `${data.name} has been moved to ${status}`,
          description: `${data.name} status has been changed to ${status}`,
          isNotified: [{ userId: project.projectManager, isNotified: false }],
        };
        yield _super.__createNotification.call(this, newNotification);
        // send to current socket clients an update
        // PM
        let PMid = socket_1.socketPMs.find(
          (item) => item.id === project.projectManager.toString()
        );
        __1.io.to(PMid.socketId).emit("notification-update");
      } catch (error) {
        logger_1.default.error({ __MoveTaskNotificationError: error });
      }
    });
  }
  static __MoveTaskNotification(data, status, user) {
    const _super = Object.create(null, {
      __createNotification: { get: () => super.__createNotification },
    });
    return __awaiter(this, void 0, void 0, function* () {
      try {
        // get Notified users
        let id = user.id;
        let project = yield Project_1.default.findOne({ _id: data.projectId });
        // create notificaton
        if (project.projectManager.toString() !== id) {
          let newNotification = {
            title: `${data.name} has been moved to ${status}`,
            description: `${data.name} status has been changed to ${status}`,
            isNotified: [{ userId: project.projectManager, isNotified: false }],
          };
          yield _super.__createNotification.call(this, newNotification);
          // send to current socket clients an update
          // PM
          let PMid = socket_1.socketPMs
            .filter((item) => item.id === project.projectManager.toString())
            .map((item) => item.socketId);
          if (PMid && project.projectManager !== id)
            __1.io.to(PMid).emit("notification-update");
        }
      } catch (error) {
        logger_1.default.error({ __MoveTaskNotificationError: error });
      }
    });
  }
  static __getUnNotified(userId) {
    const _super = Object.create(null, {
      __getUnotified: { get: () => super.__getUnotified },
    });
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let unNotified = yield _super.__getUnotified.call(this, userId);
        return unNotified;
      } catch (error) {
        logger_1.default.error({ __getUnNotifiedError: error });
      }
    });
  }
  static __updateUnotified(userId) {
    const _super = Object.create(null, {
      __updateUnotifiedDB: { get: () => super.__updateUnotifiedDB },
    });
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let updateUnNotified = yield _super.__updateUnotifiedDB.call(
          this,
          userId
        );
        return updateUnNotified;
      } catch (error) {
        logger_1.default.error({ __updateUnotifiedError: error });
      }
    });
  }
  static __updateProjectNotification(data, userId) {
    const _super = Object.create(null, {
      __createNotification: { get: () => super.__createNotification },
    });
    return __awaiter(this, void 0, void 0, function* () {
      // to the PM if not the current user, and admins except the current user
      try {
        if (
          data.projectStatus &&
          ["deliver on time", "deliver before deadline", "late"].includes(
            data.projectStatus
          )
        ) {
          if (data.projectManager !== userId) {
            let notification = yield _super.__createNotification.call(this, {
              title: `${data.name} project is done ! congratulations`,
              description: `${data.name} project is done. Thank you for your hard work.`,
              isNotified: [{ userId: data.projectManager, isNotified: false }],
            });
            let pm = socket_1.socketPMs
              .filter((item) => item.id === data.projectManager)
              .map((item) => item.socketId);
            if (userId !== data.projectManager)
              __1.io.to(pm).emit("notification-update");
          }
          let OMS = yield (yield User_1.default
            .find({ role: "OM" })
            .select("_id")
            .lean()).map((item) => {
            return { userId: item._id.toString(), isNotified: false };
          });
          let users = OMS.filter((item) => item.userId !== userId);
          let notification = yield _super.__createNotification.call(this, {
            title: `${data.name} project status changed to done`,
            description: `${data.name} project status changed to done`,
            isNotified: users,
          });
          let oms = socket_1.socketOM
            .filter((item) => item.id !== userId)
            .map((item) => item.socketId);
          if (data.adminId.toString() !== userId)
            __1.io.to(oms).emit("notification-update");
        }
      } catch (error) {
        logger_1.default.error({ __updateProjectNotificationError: error });
      }
    });
  }
  static __creatProjectNotification(data, userId) {
    const _super = Object.create(null, {
      __createNotification: { get: () => super.__createNotification },
    });
    return __awaiter(this, void 0, void 0, function* () {
      // to the PM if not created by him, and other admins without the userId
      try {
        let user = yield User_1.default.findById(userId);
        if (userId !== data.projectManager) {
          yield _super.__createNotification.call(this, {
            title: `${data.name} has been assigned to you`,
            description: `${data.name} has assigned to you by ${user.name}`,
            isNotified: [{ userId: data.projectManager, isNotified: false }],
          });
          let pm = socket_1.socketPMs
            .filter((item) => item.id === data.projectManager)
            .map((item) => item.socketId);
          if (userId !== data.projectManager)
            __1.io.to(pm).emit("notification-update");
        }
        let OMS = yield (yield User_1.default
          .find({ role: "OM" })
          .select("_id")
          .lean()).map((item) => {
          return { userId: item._id.toString(), isNotified: false };
        });
        let OMusers = OMS.filter((item) => item.userId !== userId);
        let notification = yield _super.__createNotification.call(this, {
          title: `${data.name} has started`,
          description: `${data.name} has created by ${user.name}`,
          isNotified: OMusers,
        });
        let oms = socket_1.socketOM
          .filter((item) => item.id !== userId)
          .map((item) => item.socketId);
        __1.io.to(oms).emit("notification-update");
      } catch (error) {
        logger_1.default.error({ __updateProjectNotificationError: error });
      }
    });
  }
};
exports.default = NotificationController;
