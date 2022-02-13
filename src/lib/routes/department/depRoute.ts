import { Router } from "express";
import DepartmentReq from "../../presentation/department/department";
import apiRoute from "./apis";

const router = Router();
const { CREATE_DEP, UPDATE_DEP, DELETE_DEP, GET_DEPS } = apiRoute;

const {
  handleCreateDepartment,
  handleDeleteDepartment,
  handleGetDepartment,
  handleUpdateDepartment,
} = DepartmentReq;

router.post(`${CREATE_DEP}`, handleCreateDepartment);
router.put(`${UPDATE_DEP}`, handleUpdateDepartment);
router.delete(`${DELETE_DEP}`, handleDeleteDepartment);
router.get(`${GET_DEPS}`, handleGetDepartment);

export default router;
