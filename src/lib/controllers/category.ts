import { Category, CategoryData } from "./../types/model/Category";
import { SubcategoryData } from "./../types/model/Subcategory";
import { customeError } from "./../utils/errorUtils";
import logger from "../../logger";
import CategoryDB from "../dbCalls/category/category";

const CategoryController = class CategoryController extends CategoryDB {
  static async createCategory(data: CategoryData) {
    return await CategoryController.__createNewCategory(data);
  }
  static async createSubcategory(data: SubcategoryData) {
    return await CategoryController.__createNewSubcategory(data);
  }

  static async updateCategoryWithSubcategoriesId(data: any) {
    return await CategoryController.__updateCategoryWithSubcategoriesId(data);
  }
  static async getCategories() {
    return await CategoryController.__getAllCategories();
  }
  static async __createNewCategory(data: CategoryData) {
    try {
      let category = await super.createCategory(data);
      return category;
    } catch (error) {
      logger.error({ createCategoryError: error });
    }
  }

  static async __createNewSubcategory(data: SubcategoryData) {
    try {
      let subCategory = await super.createSubcategory(data);
      return subCategory;
    } catch (error) {
      logger.error({ createSubCategoryError: error });
    }
  }

  static async __updateCategoryWithSubcategoriesId(data: any) {
    try {
      let category = await super.updateCategoryWithSubcategoriesId(data);
      return category;
    } catch (error) {
      logger.error({ updateCategoryError: error });
    }
  }
  static async __getAllCategories() {
    try {
      let categories = await super.getAllCategoriesDB();
      return categories;
    } catch (error) {
      logger.error({ getAllCategories: error });
    }
  }
};
export default CategoryController;
