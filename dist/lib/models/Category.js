"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    category: {
        type: String,
        required: true,
        unique: true,
    },
    subCategoriesId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "subcategories",
        },
    ],
}, {
    timestamps: true,
    strict: false,
});
const Categories = (0, mongoose_1.model)("category", CategorySchema);
exports.default = Categories;
