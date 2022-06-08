"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const techMember_1 = __importDefault(require("../../presentation/techMember/techMember"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_TECH_MEMBER, UPDATE_TEC_MEMBER, GET_TECH_MEMBER, DELETE_TECH_MEMBER } = apis_1.default;
const { handleCreatMember, handleUpdateTechMember, handleGetTecMember, handleDeleteTechMember } = techMember_1.default;
router.post(`${CREATE_TECH_MEMBER}`, handleCreatMember);
router.put(`${UPDATE_TEC_MEMBER}`, handleUpdateTechMember);
router.get(`${GET_TECH_MEMBER}`, handleGetTecMember);
router.delete(`${DELETE_TECH_MEMBER}`, handleDeleteTechMember);
exports.default = router;
