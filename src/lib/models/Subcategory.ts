import { Subcategory } from "./../types/model/Subcategory";
import { model, Schema, Model } from "mongoose";

const SubcategorySchema: Schema<Subcategory> = new Schema<Subcategory>(
  {
    subCategory: {
      type: String,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const SubCategories: Model<Subcategory> = model(
  "subcategories",
  SubcategorySchema
);

export default SubCategories;
