import { Category, CategoryData } from "./../types/model/Category";
import { SubcategoryData } from "./../types/model/Subcategory";
import { customeError } from "./../utils/errorUtils";
import logger from "../../logger";
import CategoryDB from "../dbCalls/category/category";
import CategoyDB from "../dbCalls/category/category";

const CategoryController = class CategoryController extends CategoryDB {
  static async createCategory(data: CategoryData) {
    return await CategoryController.__createNewCategory(data);
  }
  static async createSubcategory(data: string) {
    return await CategoryController.__createNewSubcategory(data);
  }

  static async updateCategory(data: any) {
    return await CategoryController.__updateCategory(data);
  }
  static async getCategories() {
    return await CategoryController.__getAllCategories();
  }

  static async deleteCategory(id: string) {
    return await CategoryController.__deleteCategory(id);
  }

  static async __deleteCategory(id: string) {
    try {
      const deletedCategory = await super.deleteCategoryDB(id);
      return deletedCategory;
    } catch (error) {
      logger.error({ deleteCategoryError: error });
    }
  }
  static async __createNewCategory(data: CategoryData) {
    try {
      const { subCategories } = data;
      let subCategoryIds = [];
      // create sunCategory if exsit
      if (data.subCategories.length > 0) {
        for (let i = 0; i < subCategories.length; i++) {
          let subCategory = await CategoryController.createSubcategory(
            subCategories[i]
          );
          subCategoryIds.push(subCategory._id);
        }
      }

      // create category
      let category = await super.createCategory({
        ...data,
        subCategoriesId: subCategoryIds,
        selectedSubCategory: subCategoryIds,
      });

      return category;
    } catch (error) {
      logger.error({ createCategoryError: error });
    }
  }

  static async __createNewSubcategory(data: string) {
    try {
      let subCategory = await super.createSubcategory(data);
      return subCategory;
    } catch (error) {
      logger.error({ createSubCategoryError: error });
    }
  }

  static async __updateCategory(data: any) {
    try {
      // add new subcategory then update data
      if (data.newSubCategory) {
        let updatedCategory = [];
        for (let i = 0; i < data.newSubCategory.length; i++) {
          let subCategory = await CategoryController.createSubcategory(
            data.newSubCategory[i]
          );
          logger.info({ subCategory });
          updatedCategory[i] = subCategory._id;
        }
        data.subCategoriesId = updatedCategory;
      }
      let category = await super.updateCategoryDB(data);
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
