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
const mongoose = require("mongoose");
const ProjectDB = class ProjectDB {
    static createProjectDB(data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__createProject(data, user);
        });
    }
    static updateProjectDB(data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__updateProject(data, user);
        });
    }
    static getProjectDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectDB.__getProjects(data);
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
    static deleteProjectsDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let deleteResult = yield Project_1.default.deleteMany(data);
            return deleteResult;
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
                let project = yield Project_1.default.findOne(data);
                return project;
            }
            catch (error) {
                logger_1.default.error({ getProjectDBError: error });
            }
        });
    }
    static __getProjects(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let fetch = yield Project_1.default.aggregate([
                    { $match: { $and: [data] } },
                    {
                        $lookup: {
                            from: "tasks",
                            localField: "_id",
                            foreignField: "projectId",
                            as: "tasks",
                        },
                    },
                    {
                        $addFields: {
                            NoOfFinishedTasks: {
                                $filter: {
                                    input: "$tasks",
                                    as: "task",
                                    cond: {
                                        $eq: ["$$task.status", "Done"],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            projectManager: 1,
                            projectManagerName: 1,
                            adminId: 1,
                            projectDeadline: 1,
                            startDate: 1,
                            completedDate: 1,
                            projectStatus: 1,
                            clientId: 1,
                            NoOfTasks: { $size: "$tasks" },
                            NoOfFinishedTasks: { $size: "$NoOfFinishedTasks" },
                            cardId: 1,
                            listId: 1,
                            boardId: 1,
                            associateProjectManager: 1,
                        },
                    },
                ]);
                return fetch;
            }
            catch (error) {
                logger_1.default.error({ getProjectDBError: error });
            }
        });
    }
    static __updateProject(data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data._id;
                delete data._id;
                let query = data;
                let project = yield Project_1.default.findById(id);
                if (project) {
                    project.set(query);
                    project = yield Project_1.default.findOneAndUpdate({ _id: id }, project, {
                        new: true,
                        lean: true,
                        upsert: true,
                    });
                    return project;
                }
            }
            catch (error) {
                logger_1.default.error({ updateProjectDBError: error });
            }
        });
    }
    static __createProject(data, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = new Project_1.default(data);
                project = yield project.save();
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
                    filters.projectManager = mongoose.Types.ObjectId(filter.projectManager);
                if (filter.projectStatus)
                    filters.projectStatus = filter.projectStatus;
                if (filter.clientId)
                    filters.clientId = mongoose.Types.ObjectId(filter.clientId);
                if (filter.name)
                    filters.name = { $regex: filter.name };
                let fetch = yield Project_1.default.aggregate([
                    { $match: { $and: [filters] } },
                    {
                        $lookup: {
                            from: "tasks",
                            localField: "_id",
                            foreignField: "projectId",
                            as: "tasks",
                        },
                    },
                    {
                        $addFields: {
                            NoOfFinishedTasks: {
                                $filter: {
                                    input: "$tasks",
                                    as: "task",
                                    cond: {
                                        $eq: ["$$task.status", "Done"],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            projectManager: 1,
                            projectManagerName: 1,
                            adminId: 1,
                            projectDeadline: 1,
                            startDate: 1,
                            completedDate: 1,
                            projectStatus: 1,
                            clientId: 1,
                            NoOfTasks: { $size: "$tasks" },
                            NoOfFinishedTasks: { $size: "$NoOfFinishedTasks" },
                        },
                    },
                ]);
                fetch = yield Project_1.default.populate(fetch, {
                    path: "projectManager",
                    select: "_id name",
                });
                return fetch;
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
