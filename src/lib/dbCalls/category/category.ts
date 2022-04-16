import { LeanDocument } from "mongoose";
import logger from "../../../logger";
import Categories from "../../models/Category";
import SubCategories from "../../models/Subcategory";
import { CategoryData, Category } from "../../types/model/Category";
import { SubcategoryData, Subcategory } from "../../types/model/Subcategory";

const CategoyDB = class CategoryDB {
  static async createCategory(data: CategoryData) {
    return await CategoryDB.__createCategory(data);
  }
  static async createSubcategory(data: string) {
    return await CategoryDB.__createSubcategory(data);
  }
  static async updateCategoryDB(data: CategoryData) {
    return await CategoryDB.__updateCategory(data);
  }
  static async getAllCategoriesDB() {
    return await CategoryDB.__getAllCategories();
  }
  static async deleteCategoryDB(id: string) {
    return await CategoryDB.__deleteCategoryDB(id);
  }

  static async __deleteCategoryDB(id: string) {
    try {
      let category = await Categories.findByIdAndDelete({ _id: id });
      return category;
    } catch (error) {
      logger.error({ deletCategoryDBError: error });
    }
  }
  static async __createCategory(data: CategoryData) {
    try {
      delete data.subCategories;
      let category = new Categories(data);
      await category.save();
      return category;
    } catch (error) {
      logger.error({ createCategoryDBError: error });
    }
  }
  static async __createSubcategory(data: string) {
    try {
      let subcategory: Subcategory = new SubCategories({ subCategory: data });
      await subcategory.save();
      return subcategory;
    } catch (error) {
      logger.error({ createSubcategoryDBError: error });
    }
  }

  static async __updateCategory(data: any) {
    try {
      let category = await Categories.findByIdAndUpdate(
        { _id: data._id },
        { ...data },
        { new: true, lean: true }
      )
        .populate("selectedSubCategory")
        .populate("subCategoriesId");
      return category;
    } catch (error) {
      logger.error({ updateCategoryDBError: error });
    }
  }
  static async __getAllCategories() {
    try {
      let cats = await Categories.find({})
        .populate("selectedSubCategory")
        .populate("subCategoriesId")
        .lean();
      return cats;
    } catch (error) {
      logger.error({ updateCategoryDBError: error });
    }
  }
};
export default CategoyDB;
