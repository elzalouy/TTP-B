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
const successMsg_1 = require("./../../utils/successMsg");
const errorUtils_1 = require("./../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const project_1 = __importDefault(require("../../controllers/project"));
const client_1 = __importDefault(require("../../controllers/client"));
const mongoose_1 = __importDefault(require("mongoose"));
const task_1 = __importDefault(require("../../controllers/task"));
const auth_1 = require("../../services/auth");
const ProjectReq = class ProjectReq extends project_1.default {
    static handleCreateProject(req, res) {
        const _super = Object.create(null, {
            createProject: { get: () => super.createProject }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let decoded = yield (0, auth_1.jwtVerify)(req.header("authorization"));
                let projectData = req.body;
                if (!projectData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("project_missing_data", 400));
                }
                let project = yield _super.createProject.call(this, projectData, decoded);
                if (project) {
                    yield client_1.default.updateClientProcedure(projectData.clientId);
                    return res.status(200).send(project);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_project_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateProjectErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateProject(req, res) {
        const _super = Object.create(null, {
            updateProject: { get: () => super.updateProject }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let decoded = yield (0, auth_1.jwtVerify)(req.header("authorization"));
                let projectData = req.body;
                if (!projectData._id) {
                    return res.status(400).send((0, errorUtils_1.customeError)("project_missing_data", 400));
                }
                let project = yield _super.updateProject.call(this, projectData, decoded);
                if (project) {
                    yield client_1.default.updateClientProcedure(project.clientId);
                    return res.status(200).send(project);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_project_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateProjecttErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetProject(req, res) {
        const _super = Object.create(null, {
            getProject: { get: () => super.getProject }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projectData = req.query;
                if (projectData._id)
                    projectData._id = new mongoose_1.default.Types.ObjectId(projectData._id);
                let project = yield _super.getProject.call(this, projectData);
                if (project) {
                    return res.status(200).send(project);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("get_project_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetProjectErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteProject(req, res) {
        const _super = Object.create(null, {
            deleteProject: { get: () => super.deleteProject }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projectId = req.body.id;
                if (!projectId) {
                    return res.status(400).send((0, errorUtils_1.customeError)("project_missing_data", 400));
                }
                let deleteResult = yield task_1.default.deleteTasksByProjectId(projectId);
                if (deleteResult) {
                    let project = yield _super.deleteProject.call(this, projectId);
                    if (project) {
                        yield client_1.default.updateClientProcedure(project.clientId);
                        return res
                            .status(200)
                            .send((0, successMsg_1.successMsg)("projects_and_tasks_deleted", 200));
                    }
                }
                return res.status(400).send((0, errorUtils_1.customeError)("delete_project_error", 400));
            }
            catch (error) {
                logger_1.default.error({ handleDeleteProjectErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleSortProjects(req, res) {
        const _super = Object.create(null, {
            sortProjects: { get: () => super.sortProjects }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let sortBy = req.body.sortBy;
                if (!sortBy)
                    return res
                        .status(400)
                        .send((0, errorUtils_1.customeError)("sort_projects_params_empty", 400));
                let projects = yield _super.sortProjects.call(this, sortBy);
                if (projects)
                    return res.status(200).send(projects);
            }
            catch (error) {
                logger_1.default.error({ sortProjectsError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleFilterProjects(req, res) {
        const _super = Object.create(null, {
            filterProjects: { get: () => super.filterProjects }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filter = req.body;
                let projects = yield _super.filterProjects.call(this, filter);
                if (projects)
                    return res.status(200).send({ result: projects });
                else
                    return res
                        .status(400)
                        .send((0, errorUtils_1.customeError)("filter_projects_result_empty", 400));
            }
            catch (error) {
                logger_1.default.error({ filterProjectsError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleSearchPorjects(req, res) {
        const _super = Object.create(null, {
            searchProjects: { get: () => super.searchProjects }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let search = (_a = req === null || req === void 0 ? void 0 : req.params) === null || _a === void 0 ? void 0 : _a.searchStr;
                let result = yield _super.searchProjects.call(this, search);
                if (result)
                    return res.status(200).send(result);
                else
                    return res
                        .status(400)
                        .send((0, errorUtils_1.customeError)("search_Proejcts_result_null", 400));
            }
            catch (error) {
                logger_1.default.error({ filterProjectsError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleDeleteProjects(req, res) {
        const _super = Object.create(null, {
            deleteProjects: { get: () => super.deleteProjects }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = req.body;
                let result = yield _super.deleteProjects.call(this, data);
                return res.status(200).send(result);
            }
            catch (error) {
                logger_1.default.error({ deleteAllProjectsError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = ProjectReq;
