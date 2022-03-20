import { Document } from "mongoose";

export interface Category extends Document {
  category: string;
  subCategoriesId?: string[];
}

export interface CategoryData {
  id?: string;
  category: string;
  subCategories?: string[];
  subCategoriesId?: string[];
}
