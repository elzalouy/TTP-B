import { Router } from "express";
import Authed from "../../middlewares/Auth/Authed";
import testEnv from "../../middlewares/testEnv";
import ProjectReq from "../../presentation/project/project";
import apiRoute from "./apis";

const router = Router();
const {
  CREATE_PROJECT,
  UPDATE_PROJECT,
  GET_PROJECT,
  DELETE_PROJECT,
  SORT_PROJECTS,
  FILTER_PROJECTS,
  SEARCH_PROJECTS,
  DELETE_PROJECTS,
} = apiRoute;
const {
  handleCreateProject,
  handleUpdateProject,
  handleGetProject,
  handleDeleteProject,
  handleSortProjects,
  handleFilterProjects,
  handleSearchPorjects,
  handleDeleteProjects,
} = ProjectReq;

router.post(`${SORT_PROJECTS}`, Authed, handleSortProjects);
router.post(`${CREATE_PROJECT}`, Authed, handleCreateProject);
router.put(`${UPDATE_PROJECT}`, Authed, handleUpdateProject);
router.get(`${GET_PROJECT}`, Authed, handleGetProject);
router.delete(`${DELETE_PROJECT}`, Authed, handleDeleteProject);
router.post(`${FILTER_PROJECTS}`, Authed, handleFilterProjects);
router.get(`${SEARCH_PROJECTS}`, Authed, handleSearchPorjects);
router.delete(`${DELETE_PROJECTS}`, Authed, testEnv, handleDeleteProjects);
export default router;
