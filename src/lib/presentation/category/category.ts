import { successMsg } from "./../../utils/successMsg";
import { customeError } from "./../../utils/errorUtils";
import { Category, CategoryData } from "./../../types/model/Category";
import { SubcategoryData } from "./../../types/model/Subcategory";
import { Request, Response } from "express";
import logger from "../../../logger";
import CategoryController from "../../controllers/category";
import { LeanDocument } from "mongoose";

const CategoryReq = class CategoryReq extends CategoryController {
  static async handleGetCategories(req: Request, res: Response) {
    try {
      let cats = await super.getCategories();
      return res.status(200).send(cats);
    } catch (error) {
      logger.error({ handleCreateCategoryErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleCreateCategory(req: Request, res: Response) {
    try {
      let categoryData: CategoryData = req.body;
      let category = await super.createCategory(categoryData);
      if (!categoryData) {
        return res.status(400).send(customeError("category_missing_data", 400));
      }
      return res.status(200).send(category);
    } catch (error) {
      logger.error({ handleCreateCategoryErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateCategory(req: Request, res: Response) {
    try {
      let categoryData: CategoryData = req.body;
      let category = await super.updateCategory(categoryData);
      if (!categoryData) {
        return res.status(400).send(customeError("category_missing_data", 400));
      }
      return res.status(200).send(category);
    } catch (error) {
      logger.error({ handleUpdateCategoryErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteCategory(req: Request, res: Response) {
    try {
      let categoryId = req.query.id;
      let category = await super.updateCategory(categoryId);
      if (!category) {
        return res.status(400).send(customeError("category_missing_data", 400));
      }
      return res.status(200).send(category);
    } catch (error) {
      logger.error({ handleDeleteCategoryErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};
export default CategoryReq;
