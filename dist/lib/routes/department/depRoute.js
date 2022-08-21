"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Authed_1 = __importDefault(require("../../middlewares/Auth/Authed"));
const testEnv_1 = __importDefault(require("../../middlewares/testEnv"));
const department_1 = __importDefault(require("../../presentation/department/department"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_DEP, UPDATE_DEP, DELETE_DEP, GET_DEPS, DROP_TEST } = apis_1.default;
const { handleCreateDepartment, handleDeleteDepartment, handleGetDepartment, handleUpdateDepartment, handleDropTestCollection, } = department_1.default;
router.post(`${CREATE_DEP}`, handleCreateDepartment);
router.put(`${UPDATE_DEP}`, handleUpdateDepartment);
router.delete(`${DELETE_DEP}`, handleDeleteDepartment);
router.get(`${GET_DEPS}`, handleGetDepartment);
router.delete(`${DROP_TEST}`, Authed_1.default, testEnv_1.default, handleDropTestCollection);
exports.default = router;
