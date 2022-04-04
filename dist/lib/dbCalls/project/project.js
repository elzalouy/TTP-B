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
const Project_1 = __importDefault(require("../../models/Project"));
const ProjectDB = class ProjectDB {
    static createProjectDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__createProject(data);
        });
    }
    static updateProjectDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__updateProject(data);
        });
    }
    static getProjectDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__getProject(data);
        });
    }
    static deleteProjectDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__deleteProject(id);
        });
    }
    static sortProjectsDB(sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__sortProjects(sortBy);
        });
    }
    static filterProjectsDB(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__filterProjects(filter);
        });
    }
    static searchProjectsDB(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__searchProjects(searchStr);
        });
    }
    static __deleteProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = yield Project_1.default.findByIdAndDelete({ _id: id });
                return project;
            }
            catch (error) {
                logger_1.default.error({ deletProjectDBError: error });
            }
        });
    }
    static __getProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = yield Project_1.default.find(data)
                    .populate({ path: "projectManager", select: "_id name" })
                    .populate({ path: "membersId", select: "_id name" })
                    .lean();
                return project;
            }
            catch (error) {
                logger_1.default.error({ getProjectDBError: error });
            }
        });
    }
    static __updateProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data._id;
                delete data._id;
                let query = data;
                let project = yield Project_1.default.findByIdAndUpdate({ _id: id }, query, {
                    new: true,
                    lean: true,
                });
                return project;
            }
            catch (error) {
                logger_1.default.error({ updateProjectDBError: error });
            }
        });
    }
    static __createProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = new Project_1.default(data);
                yield project.save();
                return project;
            }
            catch (error) {
                logger_1.default.error({ createProjectDBError: error });
            }
        });
    }
    static __sortProjects(sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projects = yield Project_1.default.find({}).sort(sortBy);
                return projects;
            }
            catch (error) {
                logger_1.default.error({ sortProjectsDBError: error });
            }
        });
    }
    static __filterProjects(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filters = {};
                if (filter.projectManager)
                    filters.projectManager = filter.projectManager;
                if (filter.projectStatus)
                    filters.projectStatus = filter.projectStatus;
                if (filter.clientId)
                    filters.clientId = filter.clientId;
                let projects = yield Project_1.default.find(filters);
                return projects;
            }
            catch (error) {
                logger_1.default.error({ filterProjectsError: error });
            }
        });
    }
    static __searchProjects(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projects = yield Project_1.default.find({ name: searchStr }).sort("asc");
                if (projects)
                    return projects;
                else
                    return null;
            }
            catch (error) {
                logger_1.default.error({ searchProjectsError: error });
            }
        });
    }
};
exports.default = ProjectDB;
