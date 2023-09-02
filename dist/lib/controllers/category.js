"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../logger"));
const category_1 = __importDefault(require("../dbCalls/category/category"));
const CategoryController = class CategoryController extends category_1.default {
    static createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryController.__createNewCategory(data);
        });
    }
    static createSubcategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryController.__createNewSubcategory(data);
        });
    }
    static updateCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryController.__updateCategory(data);
        });
    }
    static getCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryController.__getAllCategories();
        });
    }
    static deleteCategory(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryController.__deleteCategory(id);
        });
    }
    static __deleteCategory(id) {
        const _super = Object.create(null, {
            deleteCategoryDB: { get: () => super.deleteCategoryDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deletedCategory = yield _super.deleteCategoryDB.call(this, id);
                return deletedCategory;
            }
            catch (error) {
                logger_1.default.error({ deleteCategoryError: error });
            }
        });
    }
    static __createNewCategory(data) {
        const _super = Object.create(null, {
            createCategory: { get: () => super.createCategory }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { subCategories } = data;
                let subCategoryIds = [];
                // create sunCategory if exsit
                if (data.subCategories.length > 0) {
                    for (let i = 0; i < subCategories.length; i++) {
                        let subCategory = yield CategoryController.createSubcategory(subCategories[i]);
                        subCategoryIds.push(subCategory._id);
                    }
                }
                // create category
                let category = yield _super.createCategory.call(this, Object.assign(Object.assign({}, data), { subCategoriesId: subCategoryIds, selectedSubCategory: subCategoryIds }));
                return category;
            }
            catch (error) {
                logger_1.default.error({ createCategoryError: error });
            }
        });
    }
    static __createNewSubcategory(data) {
        const _super = Object.create(null, {
            createSubcategory: { get: () => super.createSubcategory }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let subCategory = yield _super.createSubcategory.call(this, data);
                return subCategory;
            }
            catch (error) {
                logger_1.default.error({ createSubCategoryError: error });
            }
        });
    }
    static __updateCategory(data) {
        const _super = Object.create(null, {
            updateCategoryDB: { get: () => super.updateCategoryDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // add new subcategory then update data
                if (data.newSubCategory) {
                    let updatedCategory = [];
                    for (let i = 0; i < data.newSubCategory.length; i++) {
                        let subCategory = yield CategoryController.createSubcategory(data.newSubCategory[i]);
                        logger_1.default.warning({ subCategory });
                        updatedCategory[i] = subCategory._id;
                    }
                    data.subCategoriesId = updatedCategory;
                }
                let category = yield _super.updateCategoryDB.call(this, data);
                return category;
            }
            catch (error) {
                logger_1.default.error({ updateCategoryError: error });
            }
        });
    }
    static __getAllCategories() {
        const _super = Object.create(null, {
            getAllCategoriesDB: { get: () => super.getAllCategoriesDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categories = yield _super.getAllCategoriesDB.call(this);
                return categories;
            }
            catch (error) {
                logger_1.default.error({ getAllCategories: error });
            }
        });
    }
};
exports.default = CategoryController;
