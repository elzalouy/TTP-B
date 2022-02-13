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
const ProjectReq = class ProjectReq extends project_1.default {
    static handleCreateProject(req, res) {
        const _super = Object.create(null, {
            createProject: { get: () => super.createProject }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projectData = req.body;
                if (!projectData) {
                    return res.status(400).send((0, errorUtils_1.customeError)("project_missing_data", 400));
                }
                let project = yield _super.createProject.call(this, projectData);
                if (project) {
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
                let projectData = req.body;
                if (!projectData.id) {
                    return res.status(400).send((0, errorUtils_1.customeError)("project_missing_data", 400));
                }
                let project = yield _super.updateProject.call(this, projectData);
                if (project) {
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
                let projectData = req.body.query;
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
                let project = yield _super.deleteProject.call(this, projectId);
                if (project) {
                    return res.status(200).send((0, successMsg_1.successMsg)("project_deleted", 200));
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("delete_project_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleDeleteProjectErrors: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = ProjectReq;
