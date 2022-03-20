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
    // static async getCategories(req: Request, res: Response) {
    //   try {
    //     let body = req.body;
    //     let cats = await super.getCategories();
    //     return res.status(200).send(cats);
    //   } catch (error) {
    //     logger.error({ handleCreateCategoryErrors: error });
    //     return res.status(500).send(customeError("server_error", 500));
    //   }
    // }
    static handleCreateCategoryAndSubcategory(req, res) {
        const _super = Object.create(null, {
            createCategory: { get: () => super.createCategory },
            createSubcategory: { get: () => super.createSubcategory },
            updateCategoryWithSubcategoriesId: { get: () => super.updateCategoryWithSubcategoriesId }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let categoryData = req.body;
                let subCategories = req.body.subCategories;
                let category = yield _super.createCategory.call(this, categoryData);
                let subcategory;
                if (!categoryData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("category_missing_data", 400));
                }
                if (category) {
                    let categoryId = category._id;
                    if (subCategories && !subCategories.includes("")) {
                        var finalCategory;
                        subCategories.map((subcat) => __awaiter(this, void 0, void 0, function* () {
                            let subCategoryData = {
                                subCategory: subcat,
                                categoryId: categoryId,
                            };
                            subcategory = yield _super.createSubcategory.call(this, subCategoryData);
                            finalCategory = yield _super.updateCategoryWithSubcategoriesId.call(this, {
                                id: categoryId,
                                subCategoriesId: subcategory._id,
                            });
                        }));
                        return res.status(200).send(category);
                    }
                    return res.status(200).send(category);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_category_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateCategoryErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = CategoryReq;
