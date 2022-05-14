"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const SubcategorySchema = new mongoose_1.Schema({
    subCategory: {
        type: String,
    },
}, {
    timestamps: true,
    strict: true,
});
const SubCategories = (0, mongoose_1.model)("subcategories", SubcategorySchema);
exports.default = SubCategories;
