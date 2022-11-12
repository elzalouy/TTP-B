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
const errorUtils_1 = require("../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const department_1 = __importDefault(require("../../controllers/department"));
const DepartmentReq = class DepartmentReq extends department_1.default {
    static handleCreateDepartment(req, res) {
        const _super = Object.create(null, {
            createDepartment: { get: () => super.createDepartment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield _super.createDepartment.call(this, req.body);
                if ((response === null || response === void 0 ? void 0 : response.error) || (response === null || response === void 0 ? void 0 : response.message))
                    return res.status(400).send(response === null || response === void 0 ? void 0 : response.message);
                if (response) {
                    return res.status(200).send(response);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_dep_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateDepartmentDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateDepartment(req, res) {
        const _super = Object.create(null, {
            updateDepartment: { get: () => super.updateDepartment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let departmentData = req.body;
                let id = req.params.id;
                let response = yield _super.updateDepartment.call(this, id, departmentData);
                if ((response === null || response === void 0 ? void 0 : response.error) || (response === null || response === void 0 ? void 0 : response.message))
                    return res.status(400).send(response === null || response === void 0 ? void 0 : response.message);
                if (response) {
                    return res.status(200).send(response);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_dep_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateDepartmentDataError: error });
                return res.status(400).send(error);
            }
        });
    }
    static handleDeleteDepartment(req, res) {
        const _super = Object.create(null, {
            deleteDepartment: { get: () => super.deleteDepartment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.params.id;
                if (id) {
                    let response = yield _super.deleteDepartment.call(this, id);
                    if (response === null || response === void 0 ? void 0 : response.error)
                        return res.status(400).send(response.message);
                    return res.status(200).send(response);
                }
                else
                    return res
                        .status(400)
                        .send("Request should have an id in the query params");
            }
            catch (error) {
                logger_1.default.error({ handleDeletDepartmentDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetDepartment(req, res) {
        const _super = Object.create(null, {
            getDepartments: { get: () => super.getDepartments }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield _super.getDepartments.call(this);
                if (department) {
                    return res.status(200).send(department);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_dep_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeletDepartmentDataError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDropTestCollection(req, res) {
        const _super = Object.create(null, {
            deleteAllDocs: { get: () => super.deleteAllDocs }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield _super.deleteAllDocs.call(this);
                return res.status(200).send("done");
            }
            catch (error) {
                logger_1.default.error({ handleDropTestCollection: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = DepartmentReq;
