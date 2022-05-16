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
const logger_1 = __importDefault(require("../../logger"));
const project_1 = __importDefault(require("../dbCalls/project/project"));
const server_1 = require("../server");
const notification_1 = __importDefault(require("./notification"));
const ProjectController = class ProjectController extends project_1.default {
    static createProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__createNewProject(data);
        });
    }
    static updateProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__updateProjectData(data);
        });
    }
    static getProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__getProjectData(data);
        });
    }
    static deleteProject(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__deleteProjectData(id);
        });
    }
    static sortProjects(sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__sortProjects(sortBy);
        });
    }
    static filterProjects(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__filterProjects(filter);
        });
    }
    static searchProjects(searchStr) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield ProjectController.__searchProjects(searchStr);
        });
    }
    static __deleteProjectData(id) {
        const _super = Object.create(null, {
            deleteProjectDB: { get: () => super.deleteProjectDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = yield _super.deleteProjectDB.call(this, id);
                return project;
            }
            catch (error) {
                logger_1.default.error({ getProjectError: error });
            }
        });
    }
    static __getProjectData(data) {
        const _super = Object.create(null, {
            getProjectDB: { get: () => super.getProjectDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = yield _super.getProjectDB.call(this, data);
                return project;
            }
            catch (error) {
                logger_1.default.error({ getProjectError: error });
            }
        });
    }
    static __updateProjectData(data) {
        const _super = Object.create(null, {
            updateProjectDB: { get: () => super.updateProjectDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // if porject status update to done
                if (data.projectStatus &&
                    ["delivered on time", "delivered defore deadline"].includes(data.projectStatus)) {
                    let createNotifi = yield notification_1.default.createNotification({
                        title: `${data.name} project is done! Congratulations!`,
                        projectManagerID: data.projectManager,
                        description: `${data.name} project is done! Thank you for your hard work`,
                        clientName: data.clientId,
                        projectID: data._id,
                        adminUserID: data.adminId,
                    });
                    // send notification to all admin
                    server_1.io.to("admin room").emit("notification update", createNotifi);
                    // send notification to specific project manager
                    server_1.io.to(`user-${data.projectManager}`).emit("notification update", createNotifi);
                }
                let project = yield _super.updateProjectDB.call(this, data);
                return project;
            }
            catch (error) {
                logger_1.default.error({ updateProjectError: error });
            }
        });
    }
    static __createNewProject(data) {
        const _super = Object.create(null, {
            createProjectDB: { get: () => super.createProjectDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let project = yield _super.createProjectDB.call(this, data);
                let createNotifi = yield notification_1.default.createNotification({
                    title: `${data.projectManagerName} project has been assigend to you`,
                    description: `${data.name} has been assigend to you by ${data.adminName}`,
                    projectManagerID: data.projectManager,
                    projectID: data._id,
                    adminUserID: data.adminId,
                });
                // send notification to specific project manager
                server_1.io.to(`user-${data.projectManager}`).emit("notification update", createNotifi);
                return project;
            }
            catch (error) {
                logger_1.default.error({ getTeamsError: error });
            }
        });
    }
    static __sortProjects(sortBy) {
        const _super = Object.create(null, {
            sortProjectsDB: { get: () => super.sortProjectsDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projects = yield _super.sortProjectsDB.call(this, sortBy);
                return projects;
            }
            catch (error) {
                logger_1.default.error({ sortProjectsError: error });
            }
        });
    }
    static __filterProjects(filter) {
        const _super = Object.create(null, {
            filterProjectsDB: { get: () => super.filterProjectsDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projects = yield _super.filterProjectsDB.call(this, filter);
                return projects;
            }
            catch (error) {
                logger_1.default.error({ flterProjectsError: error });
            }
        });
    }
    static __searchProjects(searchStr) {
        const _super = Object.create(null, {
            searchProjectsDB: { get: () => super.searchProjectsDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let projects = yield _super.searchProjectsDB.call(this, searchStr);
                if (projects)
                    return projects;
                else
                    return null;
            }
            catch (error) {
                logger_1.default.console.error({ searchPrjectsError: error });
            }
        });
    }
};
exports.default = ProjectController;
