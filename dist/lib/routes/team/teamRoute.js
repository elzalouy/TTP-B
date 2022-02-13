"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const team_1 = __importDefault(require("../../presentation/team/team"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_TEAM, UPDATE_TEAM, DELETE_TEAM, GET_TEAMS } = apis_1.default;
const { handleCreateTeam, handleUpdateTeam, handleDeleteTeam, handleGetTeam } = team_1.default;
router.post(`${CREATE_TEAM}`, handleCreateTeam);
router.put(`${UPDATE_TEAM}`, handleUpdateTeam);
router.delete(`${DELETE_TEAM}`, handleDeleteTeam);
router.get(`${GET_TEAMS}`, handleGetTeam);
exports.default = router;
