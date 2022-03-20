import { Router } from "express";
import TechMemberReq from "../../presentation/techMember/techMember";
import apiRoute from "./apis";

const router = Router();
const { CREATE_TECH_MEMBER, UPDATE_TEC_MEMBER, GET_TECH_MEMBER } = apiRoute;
const { handleCreatMember, handleUpdateTechMember, handleGetTecMember } =
  TechMemberReq;

router.post(`${CREATE_TECH_MEMBER}`, handleCreatMember);
router.put(`${UPDATE_TEC_MEMBER}`, handleUpdateTechMember);
router.get(`${GET_TECH_MEMBER}`, handleGetTecMember);

export default router;
