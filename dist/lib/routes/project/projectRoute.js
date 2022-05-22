"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const project_1 = __importDefault(require("../../presentation/project/project"));
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_PROJECT, UPDATE_PROJECT, GET_PROJECT, DELETE_PROJECT, SORT_PROJECTS, FILTER_PROJECTS, SEARCH_PROJECTS, } = apis_1.default;
const { handleCreateProject, handleUpdateProject, handleGetProject, handleDeleteProject, handleSortProjects, handleFilterProjects, handleSearchPorjects, } = project_1.default;
router.post(`${SORT_PROJECTS}`, handleSortProjects);
router.post(`${CREATE_PROJECT}`, handleCreateProject);
router.put(`${UPDATE_PROJECT}`, handleUpdateProject);
router.get(`${GET_PROJECT}`, handleGetProject);
router.delete(`${DELETE_PROJECT}`, handleDeleteProject);
router.post(`${FILTER_PROJECTS}`, handleFilterProjects);
router.get(`${SEARCH_PROJECTS}`, handleSearchPorjects);
exports.default = router;
