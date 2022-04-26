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
const errorUtils_1 = require("./../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const category_1 = __importDefault(require("../../controllers/category"));
const CategoryReq = class CategoryReq extends category_1.default {
    static handleGetCategories(req, res) {
        const _super = Object.create(null, {
            getCategories: { get: () => super.getCategories }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cats = yield _super.getCategories.call(this);
                return res.status(200).send(cats);
            }
            catch (error) {
                logger_1.default.error({ handleCreateCategoryErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleCreateCategory(req, res) {
        const _super = Object.create(null, {
            createCategory: { get: () => super.createCategory }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryData = req.body;
                let category = yield _super.createCategory.call(this, categoryData);
                if (!categoryData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("category_missing_data", 400));
                }
                return res.status(200).send(category);
            }
            catch (error) {
                logger_1.default.error({ handleCreateCategoryErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateCategory(req, res) {
        const _super = Object.create(null, {
            updateCategory: { get: () => super.updateCategory }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryData = req.body;
                let category = yield _super.updateCategory.call(this, categoryData);
                if (!categoryData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("category_missing_data", 400));
                }
                return res.status(200).send(category);
            }
            catch (error) {
                logger_1.default.error({ handleUpdateCategoryErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteCategory(req, res) {
        const _super = Object.create(null, {
            updateCategory: { get: () => super.updateCategory }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryId = req.query.id;
                let category = yield _super.updateCategory.call(this, categoryId);
                if (!category) {
                    return res.status(400).send((0, errorUtils_1.customeError)("category_missing_data", 400));
                }
                return res.status(200).send(category);
            }
            catch (error) {
                logger_1.default.error({ handleDeleteCategoryErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = CategoryReq;
