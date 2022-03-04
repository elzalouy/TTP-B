import { Router } from "express";
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
} = apiRoute;
const {
  handleCreateProject,
  handleUpdateProject,
  handleGetProject,
  handleDeleteProject,
  handleSortProjects,
  handleFilterProjects,
  handleSearchPorjects,
} = ProjectReq;

router.post(`${SORT_PROJECTS}`, handleSortProjects);
router.post(`${CREATE_PROJECT}`, handleCreateProject);
router.put(`${UPDATE_PROJECT}`, handleUpdateProject);
router.get(`${GET_PROJECT}`, handleGetProject);
router.delete(`${DELETE_PROJECT}`, handleDeleteProject);
router.post(`${FILTER_PROJECTS}`, handleFilterProjects);
router.get(`${SEARCH_PROJECTS}`, handleSearchPorjects);
export default router;
