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
const logger_1 = __importDefault(require("../../../logger"));
const Category_1 = __importDefault(require("../../models/Category"));
const Subcategory_1 = __importDefault(require("../../models/Subcategory"));
const CategoyDB = class CategoryDB {
    static createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryDB.__createCategory(data);
        });
    }
    static createSubcategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryDB.__createSubcategory(data);
        });
    }
    static updateCategoryWithSubcategoriesId(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield CategoryDB.__updateCategoryWithSubcategoriesId(data);
        });
    }
    static getAllCategoriesDB() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.__getAllCategories();
        });
    }
    static __createCategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                delete data.subCategories;
                let category = new Category_1.default(data);
                yield category.save();
                return category;
            }
            catch (error) {
                logger_1.default.error({ createCategoryDBError: error });
            }
        });
    }
    static __createSubcategory(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let subcategory = new Subcategory_1.default(data);
                yield subcategory.save();
                return subcategory;
            }
            catch (error) {
                logger_1.default.error({ createSubcategoryDBError: error });
            }
        });
    }
    static __updateCategoryWithSubcategoriesId(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let category = yield Category_1.default.findByIdAndUpdate({ _id: data.id }, { $push: { subCategoriesId: data.subCategoriesId } }, { new: true });
                return category;
            }
            catch (error) {
                logger_1.default.error({ updateCategoryDBError: error });
            }
        });
    }
    static __getAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cats = yield Category_1.default.find({}).lean();
                return cats.values;
            }
            catch (error) {
                logger_1.default.error({ updateCategoryDBError: error });
            }
        });
    }
};
exports.default = CategoyDB;
