import { Router } from "express";
import UserReq from "../../presentation/users/users";
import apiRoute from "./apis";
import BothPmOrSm from "../../middlewares/Auth/OMOrSM";
import SM from "../../middlewares/Auth/SM";
const router = Router();
const {
  CREATE_USER,
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
router.post(`${CREATE_SM}`, SM, handleCreateSM);
router.post(`${CREATE_OM}`, SM, handleCreateOM);
router.post(`${RESEND_MAIL}`, handleResendMail);
router.post(`${UPDATE_USER}`, BothPmOrSm, handleUpdateUser);
router.post(`${CREATE_PM}`, BothPmOrSm, handleCreatePM);
router.put(`${UPDATE_PASSWORD}`, handleUpdatePassword);
router.put(`${RESET_PASSWORD}`, handleResetPassword);
router.delete(`${DELETE_USER}`, BothPmOrSm, handleDeleteUser);
router.get(`${GET_USERS}`, BothPmOrSm, handleGetUsers);
router.get(`${GET_USER}`, handleGetUserInfo);

export default router;
