"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_1 = __importDefault(require("../../presentation/users/users"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_USER, UPDATE_USER, UPDATE_PASSWORD, DELETE_USER, GET_USERS } = apis_1.default;
const { handleCreatUser, handleUpdateUser, handleUpdatePassword, handleDeleteUser, handleGetUserPmOrSA } = users_1.default;
router.post(`${CREATE_USER}`, handleCreatUser);
router.post(`${UPDATE_USER}`, handleUpdateUser);
router.put(`${UPDATE_PASSWORD}`, handleUpdatePassword);
router.delete(`${DELETE_USER}`, handleDeleteUser);
router.get(`${GET_USERS}`, handleGetUserPmOrSA);
exports.default = router;
