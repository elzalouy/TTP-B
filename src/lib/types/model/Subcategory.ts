import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface Subcategory extends Document {
  subCategory: String;
}

export interface SubcategoryData {
  id?: string;
  subCategory?: string;
  categoryId?: string;
}
