import { Subcategory } from "./../types/model/Subcategory";
import { model, Schema, Model } from "mongoose";

const SubcategorySchema: Schema = new Schema<Subcategory>(
  {
    subCategory: {
      type: String,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "category",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const SubCategories: Model<Subcategory> = model(
  "subcategories",
  SubcategorySchema
);

export default SubCategories;
