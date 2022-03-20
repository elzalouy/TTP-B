"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_1 = __importDefault(require("../../presentation/category/category"));
const express_1 = require("express");
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_CAT, GET_CATS } = apis_1.default;
const { handleCreateCategoryAndSubcategory } = category_1.default;
router.post(`${CREATE_CAT}`, handleCreateCategoryAndSubcategory);
exports.default = router;
