import CategoryReq from "../../presentation/category/category";
import { Router } from "express";
import apiRoute from "./apis";
import SM from "../../middlewares/Auth/SM";
import Authed from "../../middlewares/Auth/Authed";

const router = Router();
const { CREATE_CATEGORY, GET_CATEGORYS, UPDATE_CATEGORY, DELETE_CATEGORY } =
  apiRoute;

const {
  handleCreateCategory,
  handleUpdateCategory,
  handleGetCategories,
  handleDeleteCategory,
} = CategoryReq;

router.post(`${CREATE_CATEGORY}`, SM, handleCreateCategory);
router.put(`${UPDATE_CATEGORY}`, SM, handleUpdateCategory);
router.get(`${GET_CATEGORYS}`, Authed, handleGetCategories);
router.delete(`${DELETE_CATEGORY}`, SM, handleDeleteCategory);

export default router;
