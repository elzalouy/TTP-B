import { Router } from "express";
import AuthReq from "../../presentation/auth/auth";
import apiRoute from "./apis";

const router = Router();
const { SIGN_IN_USER, FORGET_PASSWORD, UPDATE_PASSWORD, LOGOUT_USER } =
  apiRoute;
const {
  handleSignInUser,
  handleUserForgetPassword,
  handleUpdateUserPassword,
  handleLogoutUser,
} = AuthReq;

router.post(`${SIGN_IN_USER}`, handleSignInUser);
router.post(`${FORGET_PASSWORD}`, handleUserForgetPassword);
router.put(`${UPDATE_PASSWORD}`, handleUpdateUserPassword);
router.post(`${LOGOUT_USER}`, handleLogoutUser);

export default router;
