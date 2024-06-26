import { Category } from "./../types/model/Category";
import { model, Schema, Model } from "mongoose";

const CategorySchema: Schema<Category> = new Schema<Category>(
  {
    category: {
      type: String,
      required: true,
      unique: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    subCategoriesId: [
      {
        type: Schema.Types.ObjectId,
        ref: "subcategories",
      },
    ],
    selectedSubCategory: [
      {
        type: Schema.Types.ObjectId,
        ref: "subcategories",
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Categories: Model<Category> = model("category", CategorySchema);

export default Categories;
