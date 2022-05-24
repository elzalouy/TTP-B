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
const tasks_1 = __importDefault(require("../dbCalls/tasks/tasks"));
const boards_1 = __importDefault(require("./boards"));
const notification_1 = __importDefault(require("./notification"));
const server_1 = require("../server");
const project_1 = __importDefault(require("../dbCalls/project/project"));
const upload_1 = require("../services/upload");
class TaskController extends tasks_1.default {
    static getTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__getTasks(data);
        });
    }
    static createTask(data, file) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__CreateNewTask(data, file);
        });
    }
    static updateTask(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__updateTaskData(data);
        });
    }
    static webhookUpdate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__webhookUpdate(data);
        });
    }
    static filterTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__filterTasksDB(data);
        });
    }
    static deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__deleteTask(id);
        });
    }
    static deleteTasksByProjectId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__deleteTasksByProjectId(id);
        });
    }
    static deleteTasks(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__deleteTasks(ids);
        });
    }
    static deleteTasksWhere(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__deleteTasksWhere(data);
        });
    }
    static moveTaskOnTrello(cardId, listId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__moveTaskOnTrello(cardId, listId, status);
        });
    }
    static __moveTaskOnTrello(cardId, listId, status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield boards_1.default.moveTaskToDiffList(cardId, listId);
                let task = yield tasks_1.default.updateOneTaskDB({
                    cardId: cardId,
                }, {
                    status: status,
                });
                return task;
            }
            catch (error) {
                logger_1.default.error({ moveTaskOnTrelloError: error });
            }
        });
    }
    static __webhookUpdate(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This action for updating card
                logger_1.default.info({ webhookUpdate: data });
                let targetTask;
                const targetList = [
                    "Not Started",
                    "Done",
                    "Shared",
                    "Review",
                    "Not Clear",
                    "Cancel",
                ];
                logger_1.default.info({
                    afterList: (_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.action) === null || _a === void 0 ? void 0 : _a.display) === null || _b === void 0 ? void 0 : _b.entities) === null || _c === void 0 ? void 0 : _c.listAfter) === null || _d === void 0 ? void 0 : _d.text,
                });
                if (targetList.includes((_h = (_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.action) === null || _e === void 0 ? void 0 : _e.display) === null || _f === void 0 ? void 0 : _f.entities) === null || _g === void 0 ? void 0 : _g.listAfter) === null || _h === void 0 ? void 0 : _h.text)) {
                    targetTask = yield tasks_1.default.updateOneTaskDB({
                        cardId: data.action.display.entities.card.id,
                    }, {
                        status: (_m = (_l = (_k = (_j = data === null || data === void 0 ? void 0 : data.action) === null || _j === void 0 ? void 0 : _j.display) === null || _k === void 0 ? void 0 : _k.entities) === null || _l === void 0 ? void 0 : _l.listAfter) === null || _m === void 0 ? void 0 : _m.text,
                    });
                    // if task status update to shared send notification
                    if (((_r = (_q = (_p = (_o = data === null || data === void 0 ? void 0 : data.action) === null || _o === void 0 ? void 0 : _o.display) === null || _p === void 0 ? void 0 : _p.entities) === null || _q === void 0 ? void 0 : _q.listAfter) === null || _r === void 0 ? void 0 : _r.text) === "Shared") {
                        let projectData = yield project_1.default.getProjectDB({
                            _id: targetTask.projectId,
                        });
                        let userName = (_v = (_u = (_t = (_s = data === null || data === void 0 ? void 0 : data.action) === null || _s === void 0 ? void 0 : _s.display) === null || _t === void 0 ? void 0 : _t.entities) === null || _u === void 0 ? void 0 : _u.memberCreator) === null || _v === void 0 ? void 0 : _v.username;
                        let cardName = (_z = (_y = (_x = (_w = data === null || data === void 0 ? void 0 : data.action) === null || _w === void 0 ? void 0 : _w.display) === null || _x === void 0 ? void 0 : _x.entities) === null || _y === void 0 ? void 0 : _y.card) === null || _z === void 0 ? void 0 : _z.text;
                        let createNotifi = yield notification_1.default.createNotification({
                            title: `${cardName} status has been changed to Shared`,
                            description: `${cardName} status has been changed to shared by ${userName}`,
                            projectManagerID: projectData.projectManager,
                            projectID: targetTask.projectId,
                            adminUserID: projectData.adminId,
                        });
                        // send notification to all the admin
                        server_1.io.to("admin room").emit("notification update", createNotifi);
                        // send notification to specific project manager
                        server_1.io.to(`user-${projectData.projectManager}`).emit("notification update", createNotifi);
                    }
                }
                else {
                    targetTask = yield tasks_1.default.updateOneTaskDB({
                        cardId: data.action.display.entities.card.id,
                    }, {
                        status: "inProgress",
                    });
                }
                return targetTask;
            }
            catch (error) {
                logger_1.default.error({ webhookUpdateError: error });
            }
        });
    }
    static __updateTaskData(data) {
        const _super = Object.create(null, {
            updateTaskDB: { get: () => super.updateTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (data.idModel) {
                    logger_1.default.info({ webhookCall: data });
                }
                else {
                    let task = yield _super.updateTaskDB.call(this, data);
                    return task;
                }
            }
            catch (error) {
                logger_1.default.error({ updateTaskError: error });
            }
        });
    }
    static __CreateNewTask(data, files) {
        const _super = Object.create(null, {
            createTaskDB: { get: () => super.createTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let createdCard = yield boards_1.default.createCardInList(data.listId, data.name);
                if (createdCard) {
                    data.cardId = createdCard.id;
                    let attachment;
                    if (files) {
                        files.forEach((file) => __awaiter(this, void 0, void 0, function* () {
                            console.log(file);
                            attachment = yield boards_1.default.createAttachmentOnCard(createdCard.id, file.path, file.filename);
                        }));
                    }
                    data.attachedFiles = attachment;
                    delete data.listId;
                    let task = yield _super.createTaskDB.call(this, data);
                    (0, upload_1.deleteAll)();
                    return { task, createdCard, attachment };
                }
                else
                    throw "Error while creating Card in Trello";
            }
            catch (error) {
                logger_1.default.error({ getTeamsError: error });
            }
        });
    }
    static __getTasks(data) {
        const _super = Object.create(null, {
            getTasksDB: { get: () => super.getTasksDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield _super.getTasksDB.call(this, data);
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ getTasksError: error });
            }
        });
    }
    static __deleteTasksByProjectId(id) {
        const _super = Object.create(null, {
            getTasksDB: { get: () => super.getTasksDB },
            deleteTasksByProjectIdDB: { get: () => super.deleteTasksByProjectIdDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield _super.getTasksDB.call(this, {
                    projectId: id,
                });
                tasks.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    yield boards_1.default.deleteCard(item.cardId);
                }));
                return yield _super.deleteTasksByProjectIdDB.call(this, id);
            }
            catch (error) {
                logger_1.default.error({ DeleteTasksByProjectId: error });
            }
        });
    }
    static __deleteTasksWhere(data) {
        const _super = Object.create(null, {
            deleteTasksWhereDB: { get: () => super.deleteTasksWhereDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // let tasks = await super.getTasksByIdsDB;
                let deleteResult = yield _super.deleteTasksWhereDB.call(this, data);
                if (deleteResult)
                    return deleteResult;
                else
                    throw "Error hapenned while deleting tasks";
            }
            catch (error) {
                logger_1.default.error({ DeleteTasksWhereError: error });
            }
        });
    }
    static __deleteTasks(ids) {
        const _super = Object.create(null, {
            getTasksByIdsDB: { get: () => super.getTasksByIdsDB },
            deleteTasksDB: { get: () => super.deleteTasksDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield _super.getTasksByIdsDB.call(this, ids);
                tasks.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                    boards_1.default.deleteCard(item.cardId);
                }));
                return yield _super.deleteTasksDB.call(this, ids);
            }
            catch (error) {
                logger_1.default.error({ DeleteTasksByProjectId: error });
            }
        });
    }
    static __deleteTask(id) {
        const _super = Object.create(null, {
            getTaskDB: { get: () => super.getTaskDB },
            deleteTaskDB: { get: () => super.deleteTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield _super.getTaskDB.call(this, id);
                console.log(task);
                if (task) {
                    yield boards_1.default.deleteCard(task === null || task === void 0 ? void 0 : task.cardId);
                    return yield _super.deleteTaskDB.call(this, id);
                }
                throw "Task not existed";
            }
            catch (error) {
                logger_1.default.error({ deleteTaskError: error });
            }
        });
    }
}
exports.default = TaskController;
