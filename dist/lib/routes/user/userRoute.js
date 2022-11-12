"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../../presentation/users/users"));
const apis_1 = __importDefault(require("./apis"));
const OMOrSM_1 = __importDefault(require("../../middlewares/Auth/OMOrSM"));
const SM_1 = __importDefault(require("../../middlewares/Auth/SM"));
const Authed_1 = __importDefault(require("../../middlewares/Auth/Authed"));
const router = (0, express_1.Router)();
const { UPDATE_USER, UPDATE_PASSWORD, DELETE_USER, GET_USERS, GET_USER, RESET_PASSWORD, RESEND_MAIL, CREATE_PM, CREATE_OM, CREATE_SM, } = apis_1.default;
const { handleUpdateUser, handleUpdatePassword, handleDeleteUser, handleGetUsers, handleGetUserInfo, handleResetPassword, handleResendMail, handleCreateOM, handleCreatePM, handleCreateSM, } = users_1.default;
router.post(`${CREATE_SM}`, SM_1.default, handleCreateSM);
router.post(`${CREATE_OM}`, SM_1.default, handleCreateOM);
router.post(`${RESEND_MAIL}`, handleResendMail);
router.post(`${UPDATE_USER}`, OMOrSM_1.default, handleUpdateUser);
router.post(`${CREATE_PM}`, OMOrSM_1.default, handleCreatePM);
router.put(`${UPDATE_PASSWORD}`, handleUpdatePassword);
router.put(`${RESET_PASSWORD}`, handleResetPassword);
router.delete(`${DELETE_USER}`, OMOrSM_1.default, handleDeleteUser);
router.get(`${GET_USERS}`, Authed_1.default, handleGetUsers);
router.get(`${GET_USER}`, handleGetUserInfo);
exports.default = router;
