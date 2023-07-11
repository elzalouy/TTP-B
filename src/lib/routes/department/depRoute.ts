import { Router } from "express";
import Authed from "../../middlewares/Auth/Authed";
import OM from "../../middlewares/Auth/OM";
import OMOrSM from "../../middlewares/Auth/OMOrSM";
import testEnv from "../../middlewares/testEnv";
import DepartmentReq from "../../presentation/department/department";
import apiRoute from "./apis";
import SM from "../../middlewares/Auth/SM";

const router = Router();
const {
  CREATE_DEP,
  UPDATE_DEP,
  DELETE_DEP,
  GET_DEPS,
  DROP_TEST,
  UPDATE_DEPS_PRIORITY,
} = apiRoute;

const {
  handleCreateDepartment,
  handleDeleteDepartment,
  handleGetDepartment,
  handleUpdateDepartment,
  handleDropTestCollection,
  handleUpdateDepartmentsPriority,
} = DepartmentReq;

router.post(`${CREATE_DEP}`, Authed, OMOrSM, handleCreateDepartment);
router.put(`${UPDATE_DEP}`, Authed, OMOrSM, handleUpdateDepartment);
router.delete(`${DELETE_DEP}`, Authed, OMOrSM, handleDeleteDepartment);
router.get(`${GET_DEPS}`, Authed, handleGetDepartment);
router.delete(`${DROP_TEST}`, Authed, testEnv, handleDropTestCollection);
router.put(UPDATE_DEPS_PRIORITY, Authed, SM, handleUpdateDepartmentsPriority);
export default router;
