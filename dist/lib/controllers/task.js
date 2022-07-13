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
const trello_1 = __importDefault(require("./trello"));
const upload_1 = require("../services/upload");
const taskQueue_1 = require("../background/taskQueue");
const Tasks_1 = require("../types/controller/Tasks");
class TaskController extends tasks_1.default {
    static getTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__getTasks(data);
        });
    }
    static createTask(data, files) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__CreateNewTask(data, files);
        });
    }
    static updateTask(data, files) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__updateTaskData(data, files);
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
    static downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__downloadAttachment(cardId, attachmentId);
        });
    }
    static createTaskByTrello(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__createTaskByTrello(data);
        });
    }
    static updateTaskDataByTrello(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__updateTaskByTrello(data);
        });
    }
    static moveTaskOnTrello(cardId, listId, status, list, user) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__moveTaskOnTrello(cardId, listId, status, list, user);
        });
    }
    static __moveTaskOnTrello(cardId, listId, status, list, user) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, taskQueue_1.moveTaskJob)(listId, cardId, status, user);
                taskQueue_1.TaskQueue.start();
                return { data: `Task with cardId ${cardId} has moved to list ${list}` };
            }
            catch (error) {
                logger_1.default.error({ moveTaskOnTrelloError: error });
            }
        });
    }
    static __updateTaskData(data, files) {
        const _super = Object.create(null, {
            updateTaskDB: { get: () => super.updateTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.cardId)
                    return Tasks_1.provideCardIdError;
                // recieve data
                // call a background job for updating the trello card data.
                (0, taskQueue_1.updateCardJob)(data);
                taskQueue_1.TaskQueue.start();
                // wait for both update date in db and upload,delete files to trello
                // if there are deleted files, then delete it from the db
                let deleteFiles;
                if (data === null || data === void 0 ? void 0 : data.deleteFiles) {
                    deleteFiles = JSON.parse(data === null || data === void 0 ? void 0 : data.deleteFiles);
                    data.deleteFiles = deleteFiles;
                    if (deleteFiles.length > 0) {
                        yield (deleteFiles === null || deleteFiles === void 0 ? void 0 : deleteFiles.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                            if (!item.trelloId)
                                return Tasks_1.deleteFilesError;
                            yield trello_1.default.__deleteAtachment(data.cardId, item.trelloId);
                        })));
                    }
                }
                // if there are uploading files, upload it in the controller layer.
                if (files) {
                    yield this.__createTaskAttachment(files, data);
                }
                // update data in the db in dbCalls
                delete data.attachedFiles;
                delete data.deleteFiles;
                let task = yield _super.updateTaskDB.call(this, data);
                (0, upload_1.deleteAll)();
                return task;
            }
            catch (error) {
                logger_1.default.error({ updateTaskError: error });
            }
        });
    }
    /**
     * createTaskAttachment
     * it should be fired inside of a async background job with the webhook
     * @param files to be uploaded
     * @param data to be changes
     * @returns update task
     */
    static __createTaskAttachment(files, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (files && files.length > 0) {
                    let newAttachments = yield files.map((file) => __awaiter(this, void 0, void 0, function* () {
                        return yield trello_1.default.createAttachmentOnCard(data.cardId, file);
                    }));
                    let attachedFiles = yield Promise.all(newAttachments);
                    data.attachedFiles = [];
                    attachedFiles.forEach((item) => {
                        data.attachedFiles.push({
                            trelloId: item.id,
                            name: item.fileName,
                            mimeType: item.mimeType,
                            url: item.url,
                        });
                    });
                }
                else
                    delete data.attachedFiles;
                (0, upload_1.deleteAll)();
                return data;
            }
            catch (error) {
                logger_1.default.error({ createTaskAttachmentError: error });
            }
        });
    }
    static __CreateNewTask(data, files) {
        const _super = Object.create(null, {
            createTaskDB: { get: () => super.createTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let createdCard = yield trello_1.default.createCardInList(data.listId, data.name, data.description);
                if (createdCard) {
                    data.cardId = createdCard.id;
                    let response = yield trello_1.default.createWebHook(data.cardId);
                    if (response) {
                        if (files.length > 0)
                            data = yield TaskController.__createTaskAttachment(files, data);
                        else
                            data.attachedFiles = [];
                    }
                    let task = yield _super.createTaskDB.call(this, data);
                    (0, taskQueue_1.createTaskFromBoardJob)(task);
                    taskQueue_1.TaskQueue.start();
                    return task;
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
                    yield trello_1.default.deleteCard(item.cardId);
                    yield trello_1.default.removeWebhook(item.cardId);
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
                deleteResult.forEach((item) => trello_1.default.removeWebhook(item.cardId));
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
                    trello_1.default.deleteCard(item.cardId);
                    trello_1.default.removeWebhook(item.cardId);
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
                if (task) {
                    (0, taskQueue_1.deleteTaskFromBoardJob)(task);
                    taskQueue_1.TaskQueue.start();
                    yield trello_1.default.deleteCard(task === null || task === void 0 ? void 0 : task.cardId);
                    return yield _super.deleteTaskDB.call(this, id);
                }
                throw "Task not existed";
            }
            catch (error) {
                logger_1.default.error({ deleteTaskError: error });
            }
        });
    }
    static __downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield trello_1.default.downloadAttachment(cardId, attachmentId);
                return response;
            }
            catch (error) {
                logger_1.default.error({ downloadAttachmentError: error });
                return { error: "FileError", status: 400 };
            }
        });
    }
    static __createTaskByTrello(data) {
        const _super = Object.create(null, {
            __createTaskByTrelloDB: { get: () => super.__createTaskByTrelloDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response = yield _super.__createTaskByTrelloDB.call(this, data);
                return response;
            }
            catch (error) {
                logger_1.default.error({ createTaskByTrelloError: error });
            }
        });
    }
    static __updateTaskByTrello(data) {
        const _super = Object.create(null, {
            updateTaskByTrelloDB: { get: () => super.updateTaskByTrelloDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield _super.updateTaskByTrelloDB.call(this, data);
                return task;
            }
            catch (error) {
                logger_1.default.error({ updateTaskByTrello: error });
            }
        });
    }
}
exports.default = TaskController;
