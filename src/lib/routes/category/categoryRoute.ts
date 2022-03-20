import CategoryReq from "../../presentation/category/category";
import { Router } from "express";
import apiRoute from "./apis";

const router = Router();
const { CREATE_CAT, GET_CATS } = apiRoute;

const { handleCreateCategoryAndSubcategory } = CategoryReq;

router.post(`${CREATE_CAT}`, handleCreateCategoryAndSubcategory);

export default router;
