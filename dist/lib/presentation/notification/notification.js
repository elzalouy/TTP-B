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
const logger_1 = __importDefault(require("../../../logger"));
const notification_1 = __importDefault(
  require("../../controllers/notification")
);
const auth_1 = require("../../services/auth");
const NotificationReq = class NotificationReq extends notification_1.default {
  /**
   * sendNotifications
   *
   * A presentation function receive the user request to get his notifications
   * It accepts req from user to get the new notifications.
   * @param req Request from user to get the current page of notifications.
   * @param res Response should be a page of notificationd with NoOfPages, currentPage, NoOfItems (pagination)
   */
  static sendNotifications(req, res) {
    const _super = Object.create(null, {
      __sendNotifications: { get: () => super.__sendNotifications },
    });
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let decoded = yield (0, auth_1.jwtVerify)(req.header("authorization"));
        if (
          (_a =
            decoded === null || decoded === void 0 ? void 0 : decoded.user) ===
            null || _a === void 0
            ? void 0
            : _a.id
        ) {
          let notifications = yield _super.__sendNotifications.call(
            this,
            (_b =
              decoded === null || decoded === void 0
                ? void 0
                : decoded.user) === null || _b === void 0
              ? void 0
              : _b.id,
            parseInt(req.params.current),
            parseInt(req.params.limit)
          );
          return res.status(200).send(notifications);
        }
      } catch (error) {
        logger_1.default.error({ sendNotificationsError: error });
      }
    });
  }
  /**
   * updateNotified
   *
   * A presentation function accepts the user request to update notifications to the notified status with isNotified=true
   * @param req Request with notifications ids to update
   * @param res Response should be sent to the user with NoOfUnNotified
   */
  static updateNotified(req, res) {
    const _super = Object.create(null, {
      __updateUnotified: { get: () => super.__updateUnotified },
    });
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let decoded = yield (0, auth_1.jwtVerify)(req.header("authorization"));
        if (
          (_a =
            decoded === null || decoded === void 0 ? void 0 : decoded.user) ===
            null || _a === void 0
            ? void 0
            : _a.id
        ) {
          let updateUnNotified = yield _super.__updateUnotified.call(
            this,
            (_b =
              decoded === null || decoded === void 0
                ? void 0
                : decoded.user) === null || _b === void 0
              ? void 0
              : _b.id
          );
          console.log(updateUnNotified);
          return res.status(200).send(updateUnNotified);
        }
      } catch (error) {
        logger_1.default.error({ updateNotifiedUserError: error });
      }
    });
  }
  /**
   * getUnNotified
   *
   * A presentation function reveive the user request to get the number of notifications with inNotified=false.
   *
   * @param req Request with no data except the user token
   * @param res Response should be sent to the user which is NoOfUnNotified = the number of notifications with inNotified=false
   */
  static getUnNotified(req, res) {
    const _super = Object.create(null, {
      __getUnNotified: { get: () => super.__getUnNotified },
    });
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let decoded = yield (0, auth_1.jwtVerify)(req.header("authorization"));
        if (
          (_a =
            decoded === null || decoded === void 0 ? void 0 : decoded.user) ===
            null || _a === void 0
            ? void 0
            : _a.id
        ) {
          let notified = yield _super.__getUnNotified.call(
            this,
            (_b =
              decoded === null || decoded === void 0
                ? void 0
                : decoded.user) === null || _b === void 0
              ? void 0
              : _b.id
          );
          return res.status(200).send(notified);
        }
      } catch (error) {
        logger_1.default.error({ getUnNotifiedError: error });
      }
    });
  }
};
exports.default = NotificationReq;
