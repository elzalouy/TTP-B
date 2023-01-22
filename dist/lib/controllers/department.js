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
const config_1 = __importDefault(require("config"));
const logger_1 = __importDefault(require("../../logger"));
const department_actions_queue_1 = require("../backgroundJobs/actions/department.actions.queue");
const Department_1 = __importDefault(require("../models/Department"));
const Department_2 = require("../types/model/Department");
const trello_1 = __importDefault(require("./trello"));
class DepartmentController {
    static createDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__createNewDepartment(data);
        });
    }
    static deleteAllDocs() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__deleteAllDocs();
        });
    }
    static updateDepartment(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__updateDepartmentData(id, data);
        });
    }
    static deleteDepartment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__deleteDepartmentData(id);
        });
    }
    static getDepartments() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__getDepartmentsData();
        });
    }
    static __getDepartmentsData() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield Department_1.default.find();
            }
            catch (error) {
                logger_1.default.error({ getDepartmentsError: error });
            }
        });
    }
    static __deleteDepartmentData(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.findById(id);
                if (!department)
                    return { error: "NotFound", message: "Department was not found" };
                if (department.name !== config_1.default.get("CreativeBoard")) {
                    let response = yield department.deleteDepartment();
                    return response;
                }
                else
                    return {
                        error: "CreativeBoard",
                        message: "Creative department must not be deleted, it includes all projects",
                    };
            }
            catch (error) {
                logger_1.default.error({ deleteDepartmentError: error });
            }
        });
    }
    static __updateDepartmentData(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // 1- get department
                let department = yield Department_1.default.findOne({ _id: id });
                if (!department)
                    return { error: "NotFound", message: "Department was not found" };
                //2- Validate & Update
                let validation = department.updateDepartmentValidate(data);
                if (validation.error)
                    return validation.error.details[0];
                else {
                    let response = yield department.updateDepartment(data);
                    response = yield response.save();
                    return response;
                }
            }
            catch (error) {
                logger_1.default.error({ updateDepartmentError: error });
                return error;
            }
        });
    }
    static __createNewDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let depDoc = new Department_1.default({
                    name: data.name,
                    color: data.color,
                    teams: data.teams,
                    boardId: "",
                    lists: Department_2.ListTypes.map((item) => {
                        return { name: item, listId: "" };
                    }),
                });
                let validation = depDoc.createDepartmentValidate();
                if (validation.error)
                    return validation.error.details[0];
                if (depDoc) {
                    let { teams, lists } = yield depDoc.createDepartmentBoard();
                    depDoc.teams = teams;
                    depDoc.lists = lists;
                    (0, department_actions_queue_1.createProjectsCardsInCreativeBoard)(depDoc);
                    return yield depDoc.save();
                }
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.error) === "MongoError" && (error === null || error === void 0 ? void 0 : error.id)) {
                    yield trello_1.default.deleteBoard(error === null || error === void 0 ? void 0 : error.boardId);
                    return error;
                }
                logger_1.default.error({ createDepartmentError: error });
            }
        });
    }
    static __deleteAllDocs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boards = yield Department_1.default.find({}).select("boardId");
                boards.map((item) => __awaiter(this, void 0, void 0, function* () { return yield trello_1.default.deleteBoard(item.boardId); }));
                yield Department_1.default.deleteMany({});
            }
            catch (error) {
                logger_1.default.error({ dropCollectionError: error });
            }
        });
    }
}
exports.default = DepartmentController;
