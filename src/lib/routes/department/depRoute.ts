import { Router } from "express";
import Authed from "../../middlewares/Auth/Authed";
import OM from "../../middlewares/Auth/OM";
import testEnv from "../../middlewares/testEnv";
import DepartmentReq from "../../presentation/department/department";
import apiRoute from "./apis";

const router = Router();
const { CREATE_DEP, UPDATE_DEP, DELETE_DEP, GET_DEPS, DROP_TEST } = apiRoute;

const {
  handleCreateDepartment,
  handleDeleteDepartment,
  handleGetDepartment,
  handleUpdateDepartment,
  handleDropTestCollection,
} = DepartmentReq;

router.post(`${CREATE_DEP}`, handleCreateDepartment);
router.put(`${UPDATE_DEP}`, handleUpdateDepartment);
router.delete(`${DELETE_DEP}`, handleDeleteDepartment);
router.get(`${GET_DEPS}`, handleGetDepartment);
router.delete(`${DROP_TEST}`, Authed, testEnv, handleDropTestCollection);
export default router;
