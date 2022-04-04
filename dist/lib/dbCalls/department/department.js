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
const bson_1 = require("bson");
const logger_1 = __importDefault(require("../../../logger"));
const Department_1 = __importDefault(require("../../models/Department"));
const DepartmentBD = class DepartmentBD {
    static createdbDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__addNewDepartment(data);
        });
    }
    static updatedbDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__updateDepartment(data);
        });
    }
    static deleteDepartmentDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__deleteDepartment(id);
        });
    }
    static getDepartmentsData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__getDepartment(data);
        });
    }
    static updateNestedRecordDepDB(DepId, Recordupdate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__updateNestedRecordDepDB(DepId, Recordupdate);
        });
    }
    static __updateNestedRecordDepDB(DepId, Recordupdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.findOneAndUpdate({ _id: new bson_1.ObjectId(DepId) }, Recordupdate);
                return department;
            }
            catch (error) {
                logger_1.default.error({ deleteNestedRecordDepDBError: error });
            }
        });
    }
    static __getDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.find(data).lean();
                return department;
            }
            catch (error) {
                logger_1.default.error({ getDepartmentDataError: error });
            }
        });
    }
    static __deleteDepartment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deletedDepartment = yield Department_1.default.findOneAndDelete({ _id: id });
                return deletedDepartment;
            }
            catch (error) {
                logger_1.default.error({ deleteDepartmentError: error });
            }
        });
    }
    static __updateDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data._id;
                delete data._id;
                let department = yield Department_1.default.findByIdAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true });
                return department;
            }
            catch (error) {
                logger_1.default.error({ updatedbDepartmentError: error });
            }
        });
    }
    static __addNewDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info({ data });
                let department = new Department_1.default(data);
                yield department.save();
                return department;
            }
            catch (error) {
                logger_1.default.error({ createDepartmentError: error });
            }
        });
    }
};
exports.default = DepartmentBD;
