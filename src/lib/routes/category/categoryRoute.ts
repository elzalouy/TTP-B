import CategoryReq from "../../presentation/category/category";
import { Router } from "express";
import apiRoute from "./apis";

const router = Router();
const { CREATE_CATEGORY, GET_CATEGORYS, UPDATE_CATEGORY, DELETE_CATEGORY } =
  apiRoute;

const {
  handleCreateCategory,
  handleUpdateCategory,
  handleGetCategories,
  handleDeleteCategory,
} = CategoryReq;

router.post(`${CREATE_CATEGORY}`, handleCreateCategory);
router.put(`${UPDATE_CATEGORY}`, handleUpdateCategory);
router.get(`${GET_CATEGORYS}`, handleGetCategories);
router.delete(`${DELETE_CATEGORY}`, handleDeleteCategory);

export default router;
