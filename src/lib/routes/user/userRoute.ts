import { Router } from "express";
import UserReq from "../../presentation/users/users";
import apiRoute from "./apis";
import BothPmOrSm from "../../middlewares/Auth/OMOrSM";
import SM from "../../middlewares/Auth/SM";
import Authed from "../../middlewares/Auth/Authed";
const router = Router();
const {
  UPDATE_USER,
  UPDATE_PASSWORD,
  DELETE_USER,
  GET_USERS,
  GET_USER,
  RESET_PASSWORD,
  RESEND_MAIL,
  CREATE_PM,
  CREATE_OM,
  CREATE_SM,
} = apiRoute;
const {
  handleUpdateUser,
  handleUpdatePassword,
  handleDeleteUser,
  handleGetUsers,
  handleGetUserInfo,
  handleResetPassword,
  handleResendMail,
  handleCreateOM,
  handleCreatePM,
  handleCreateSM,
} = UserReq;
router.post(`${CREATE_SM}`, Authed, SM, handleCreateSM);
router.post(`${CREATE_OM}`, Authed, SM, handleCreateOM);
router.post(`${RESEND_MAIL}`, Authed, handleResendMail);
router.post(`${UPDATE_USER}`, Authed, BothPmOrSm, handleUpdateUser);
router.post(`${CREATE_PM}`, Authed, BothPmOrSm, handleCreatePM);
router.put(`${UPDATE_PASSWORD}`, handleUpdatePassword);
router.put(`${RESET_PASSWORD}`, handleResetPassword);
router.delete(`${DELETE_USER}`, Authed, BothPmOrSm, handleDeleteUser);
router.get(`${GET_USERS}`, Authed, handleGetUsers);
router.get(`${GET_USER}`, Authed, handleGetUserInfo);

export default router;
