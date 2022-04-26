"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_1 = __importDefault(require("../../presentation/category/category"));
const express_1 = require("express");
const apis_1 = __importDefault(require("./apis"));
const router = (0, express_1.Router)();
const { CREATE_CATEGORY, GET_CATEGORYS, UPDATE_CATEGORY, DELETE_CATEGORY } = apis_1.default;
const { handleCreateCategory, handleUpdateCategory, handleGetCategories, handleDeleteCategory, } = category_1.default;
router.post(`${CREATE_CATEGORY}`, handleCreateCategory);
router.put(`${UPDATE_CATEGORY}`, handleUpdateCategory);
router.get(`${GET_CATEGORYS}`, handleGetCategories);
router.delete(`${DELETE_CATEGORY}`, handleDeleteCategory);
exports.default = router;
