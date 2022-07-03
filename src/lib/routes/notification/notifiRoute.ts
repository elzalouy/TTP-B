import apis from "./apis";
import { Router } from "express";
import NotificationReq from "../../presentation/notification/notification";
import Authed from "../../middlewares/Auth/Authed";

const router = Router();

const { SEND_NOTIFICATIONS, UPDATE_NOTIFIED, GET_UNNOTIFIED } = apis;

const { sendNotifications, updateNotified, getUnNotified } = NotificationReq;

router.get(SEND_NOTIFICATIONS, Authed, sendNotifications);
router.put(UPDATE_NOTIFIED, Authed, updateNotified);
router.get(GET_UNNOTIFIED, Authed, getUnNotified);
export default router;
