import { successMsg } from "./../../utils/successMsg";
import { customeError } from "./../../utils/errorUtils";
import { Category, CategoryData } from "./../../types/model/Category";
import { SubcategoryData } from "./../../types/model/Subcategory";
import { Request, Response } from "express";
import logger from "../../../logger";
import CategoryController from "../../controllers/category";
import { LeanDocument } from "mongoose";

const CategoryReq = class CategoryReq extends CategoryController {
  // static async getCategories(req: Request, res: Response) {
  //   try {
  //     let body = req.body;
  //     let cats = await super.getCategories();
  //     return res.status(200).send(cats);
  //   } catch (error) {
  //     logger.error({ handleCreateCategoryErrors: error });
  //     return res.status(500).send(customeError("server_error", 500));
  //   }
  // }
  static async handleCreateCategoryAndSubcategory(req: Request, res: Response) {
    try {
      let categoryData: CategoryData = req.body;
      let subCategories: string[] = req.body.subCategories;
      let category = await super.createCategory(categoryData);

      let subcategory;

      if (!categoryData) {
        return res.status(400).send(customeError("category_missing_data", 400));
      }
      if (category) {
        let categoryId: string = category._id;
        if (subCategories && !subCategories.includes("")) {
          var finalCategory: CategoryData;
          subCategories.map(async (subcat) => {
            let subCategoryData: SubcategoryData = {
              subCategory: subcat,
              categoryId: categoryId,
            };
            subcategory = await super.createSubcategory(subCategoryData);
            finalCategory = await super.updateCategoryWithSubcategoriesId({
              id: categoryId,
              subCategoriesId: subcategory._id,
            });
          });
          return res.status(200).send(category);
        }
        return res.status(200).send(category);
      } else {
        return res.status(400).send(customeError("create_category_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateCategoryErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};
export default CategoryReq;
