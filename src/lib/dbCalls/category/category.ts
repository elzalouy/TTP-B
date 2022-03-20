import logger from "../../../logger";
import Categories from "../../models/Category";
import SubCategories from "../../models/Subcategory";
import { CategoryData, Category } from "../../types/model/Category";
import { SubcategoryData, Subcategory } from "../../types/model/Subcategory";

const CategoyDB = class CategoryDB {
  static async createCategory(data: CategoryData) {
    return await CategoryDB.__createCategory(data);
  }
  static async createSubcategory(data: SubcategoryData) {
    return await CategoryDB.__createSubcategory(data);
  }
  static async updateCategoryWithSubcategoriesId(data: CategoryData) {
    return await CategoryDB.__updateCategoryWithSubcategoriesId(data);
  }
  static async getAllCategoriesDB() {
    return await this.__getAllCategories();
  }
  static async __createCategory(data: CategoryData) {
    try {
      delete data.subCategories;
      let category: Category = new Categories(data);
      await category.save();
      return category;
    } catch (error) {
      logger.error({ createCategoryDBError: error });
    }
  }
  static async __createSubcategory(data: SubcategoryData) {
    try {
      let subcategory: Subcategory = new SubCategories(data);
      await subcategory.save();
      return subcategory;
    } catch (error) {
      logger.error({ createSubcategoryDBError: error });
    }
  }

  static async __updateCategoryWithSubcategoriesId(data: any) {
    try {
      let category = await Categories.findByIdAndUpdate(
        { _id: data.id },
        { $push: { subCategoriesId: data.subCategoriesId } },
        { new: true }
      );
      return category;
    } catch (error) {
      logger.error({ updateCategoryDBError: error });
    }
  }
  static async __getAllCategories() {
    try {
      let cats = await Categories.find({}).lean();
      return cats.values;
    } catch (error) {
      logger.error({ updateCategoryDBError: error });
    }
  }
};
export default CategoyDB;
