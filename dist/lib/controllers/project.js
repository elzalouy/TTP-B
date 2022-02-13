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
                return project;
            }
            catch (error) {
                logger_1.default.error({ getTeamsError: error });
            }
        });
    }
};
exports.default = ProjectController;
