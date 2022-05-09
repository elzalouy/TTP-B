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
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // This action for updating card
                logger_1.default.info({ webhookUpdate: data });
                let targetTask;
                const targetList = [
                    "done",
                    "Shared",
                    "Review",
                    "Tasks Board",
                    "Unclear brief",
                    "cancel",
                ];
                if (targetList.includes(data.action.display.entities.listAfter.text)) {
                    targetTask = yield tasks_1.default.updateOneTaskDB({
                        cardId: data.action.display.entities.card.id,
                    }, {
                        status: data.action.display.listAfter.text,
                    });
                    // if task status update to shared send notification
                    if (data.action.display.entities.listAfter.text === "Shared") {
                        let projectData = yield project_1.default.getProjectDB({
                            _id: targetTask.projectId,
                        });
                        let userName = data.action.display.entities.memberCreator.username;
                        let cardName = data.action.display.entities.card.text;
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
                        status: "In Progress",
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
    static __CreateNewTask(data, file) {
        const _super = Object.create(null, {
            createTaskDB: { get: () => super.createTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Add task to the list
                let createdCard = yield boards_1.default.createCardInList(data.listId, data.name, file);
                data.cardId = createdCard.id;
                // Check if there is attachment
                let attachment;
                if (file) {
                    attachment = yield boards_1.default.createAttachmentOnCard(createdCard.id, file);
                }
                // Add task to DB
                delete data.listId;
                let task = yield _super.createTaskDB.call(this, data);
                return { task, createdCard, attachment };
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
                yield boards_1.default.deleteCard(task.cardId);
                return yield _super.deleteTaskDB.call(this, id);
            }
            catch (error) {
                logger_1.default.error({ DeleteTasksByProjectId: error });
            }
        });
    }
}
exports.default = TaskController;
