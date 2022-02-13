"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = __importDefault(require("../../presentation/auth/auth"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { SIGN_IN_USER, FORGET_PASSWORD, UPDATE_PASSWORD, LOGOUT_USER } = apis_1.default;
const { handleSignInUser, handleUserForgetPassword, handleUpdateUserPassword, handleLogoutUser } = auth_1.default;
router.post(`${SIGN_IN_USER}`, handleSignInUser);
router.post(`${FORGET_PASSWORD}`, handleUserForgetPassword);
router.put(`${UPDATE_PASSWORD}`, handleUpdateUserPassword);
router.post(`${LOGOUT_USER}`, handleLogoutUser);
exports.default = router;
