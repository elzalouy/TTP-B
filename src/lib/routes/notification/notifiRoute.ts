import apis from "./apis";
import { Router } from "express";
import NotificationReq from "../../presentation/notification/notification";

const router = Router();

const { GET_ALL_NOTIFIS, DELETE_NOTIFI, UPDATE_NOTIFI, CREATE_NOTIFI } = apis;

const {
  handleCreateNotification,
  handleUpdateNotification,
  handleDeleteNotification,
  handleGetAllNotifications,
} = NotificationReq;

router.post(`${CREATE_NOTIFI}`, handleCreateNotification);
router.put(`${UPDATE_NOTIFI}`, handleUpdateNotification);
router.delete(`${DELETE_NOTIFI}`, handleDeleteNotification);
router.get(`${GET_ALL_NOTIFIS}`, handleGetAllNotifications);

export default router;
