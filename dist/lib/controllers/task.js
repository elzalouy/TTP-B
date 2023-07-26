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
const task_actions_Queue_1 = require("../backgroundJobs/actions/task.actions.Queue");
const Tasks_1 = require("../types/controller/Tasks");
const tasks_Route_Queue_1 = require("../backgroundJobs/routes/tasks.Route.Queue");
const Department_1 = require("../types/model/Department");
const trello_2 = __importDefault(require("./trello"));
const Task_1 = __importDefault(require("../models/Task"));
const fs_1 = require("fs");
const crypto_1 = require("crypto");
class TaskController extends tasks_1.default {
    static getTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskController.__getTasks(data);
        });
    }
    static createTask(data, files) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO update this function with the new implementation
            return yield TaskController.__CreateNewTask(data, files);
        });
    }
    static updateTask(data, files, tokenUser) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO update this function with the new implementation
            return yield TaskController.__updateTaskData(data, files, tokenUser);
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
            // TODO update this function with the new implementation
            return yield TaskController.__createTaskByTrello(data);
        });
    }
    static moveTaskOnTrello(cardId, listId, status, department, user, deadline) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO update this function with the new implementation
            return yield TaskController.__moveTaskOnTrello(cardId, listId, status, department, user, deadline);
        });
    }
    static __moveTaskOnTrello(cardId, listId, status, department, user, deadline) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                (0, task_actions_Queue_1.moveTaskJob)(listId, cardId, status, department, user, deadline);
                return {
                    data: `Task with cardId ${cardId} has moved to list ${department.lists.find((list) => list.listId === listId).name}`,
                };
            }
            catch (error) {
                logger_1.default.error({ moveTaskOnTrelloError: error });
            }
        });
    }
    static __updateTaskData(data, files, tokenUser) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!data.cardId)
                    return Tasks_1.provideCardIdError;
                (0, task_actions_Queue_1.updateCardJob)(data, files, tokenUser);
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
                return data;
            }
            catch (error) {
                logger_1.default.error({ createTaskAttachmentError: error });
            }
        });
    }
    /**
     * Create New Task
     * Create task with the initial data needed, it takes the initial data (taskData, and files)
     * * name (required)
     * * projectId (required)
     * * categoryId (optional)
     * * subCategoryId (optional)
     * * boardId (required)
     * * cardId (required)
     * * listId (required)
     * * status (required)
     * * start (required)
     * * description (optional)
     * * AttachedFiles [Array]
     *   * mimeType
     *   * id
     *   * name
     *   * url
     *   * fileName
     * * movements (at least 1)
     *   * index
     *   * status
     *   * movedAt
     * @param data TaskData
     * @param files TaskFiles
     * @returns Task
     */
    static __CreateNewTask(data, files) {
        const _super = Object.create(null, {
            createTaskDB: { get: () => super.createTaskDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task;
                data.attachedFiles = [];
                let createdCard = yield trello_1.default.createCardInList(data);
                if (createdCard) {
                    data.cardId = createdCard.id;
                    data.trelloShortUrl = createdCard.shortUrl;
                    if (data.teamId)
                        data.assignedAt = new Date(Date.now());
                    task = yield _super.createTaskDB.call(this, data);
                    if (task) {
                        tasks_Route_Queue_1.taskRoutesQueue.push(() => __awaiter(this, void 0, void 0, function* () {
                            data.cardId = createdCard.id;
                            data.trelloShortUrl = createdCard.shortUrl;
                            if (files.length > 0)
                                data = yield TaskController.__createTaskAttachment(files, data);
                            trello_1.default.createWebHook(data.cardId, "trelloWebhookUrlTask");
                        }));
                    }
                }
                return task;
            }
            catch (error) {
                logger_1.default.error({ createTaskError: error });
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
                let csvData = yield Task_1.default.getTasksAsCSV(tasks
                    .filter((item) => item.status === "Not Clear")
                    .map((item) => item._id));
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
                    if (item.cardId) {
                        yield trello_1.default.deleteCard(item.cardId);
                        yield trello_1.default.removeWebhook(item.cardId);
                    }
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
                    (0, task_actions_Queue_1.deleteTaskFromBoardJob)(task);
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
    static __createNotSavedCardsOnBoard(board) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cards = yield trello_2.default.__getCardsInBoard(board.boardId);
                if (cards) {
                    let tasks = yield TaskController.getTasks({ boardId: board.boardId });
                    if (tasks) {
                        cards.map((item) => __awaiter(this, void 0, void 0, function* () {
                            var _a, _b, _c, _d, _e;
                            let isTaskFound = tasks.find((task) => task.cardId === item.id);
                            let isList = (_a = board.lists.find((list) => list.listId === item.idList)) === null || _a === void 0 ? void 0 : _a.name;
                            let isStatusList = isList && Department_1.ListTypes.includes(isList) ? true : false;
                            let cardList = isList
                                ? board.lists.find((list) => list.listId === item.idList)
                                : board.teams.find((list) => list.listId === item.idList);
                            let task = {
                                boardId: item.idBoard,
                                cardId: item.id,
                                trelloShortUrl: item.shortUrl,
                                name: item.name,
                                description: (_b = item.desc) !== null && _b !== void 0 ? _b : "",
                                start: (_c = item.start) !== null && _c !== void 0 ? _c : null,
                                deadline: (_d = item.due) !== null && _d !== void 0 ? _d : null,
                                listId: isList
                                    ? item.idList
                                    : board.lists.find((item) => item.name === "In Progress")
                                        .listId,
                                status: isList !== null && isList !== void 0 ? isList : "In Progress",
                                movements: (_e = isTaskFound === null || isTaskFound === void 0 ? void 0 : isTaskFound.movements) !== null && _e !== void 0 ? _e : [
                                    {
                                        status: isList ? isList : "In Progress",
                                        movedAt: new Date(Date.now()).toString(),
                                    },
                                ],
                            };
                            if (isTaskFound === null || isTaskFound === void 0 ? void 0 : isTaskFound._id) {
                                task.teamId = isStatusList ? isTaskFound.teamId : cardList._id;
                                task = yield Task_1.default.findOneAndUpdate({ cardId: item.id }, task);
                            }
                            else {
                                task.teamId = isStatusList ? null : cardList._id;
                                yield new Task_1.default(task).save();
                            }
                            yield trello_2.default.__addWebHook(task.cardId, "trelloWebhookUrlTask");
                        }));
                    }
                }
            }
            catch (error) {
                logger_1.default.error({ __createNotSavedCardsOnBoardError: error });
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
                if (response === null || response === void 0 ? void 0 : response.cardId)
                    yield trello_1.default.createWebHook(response.cardId, "trelloWebhookUrlTask");
                return response;
            }
            catch (error) {
                logger_1.default.error({ createTaskByTrelloError: error });
            }
        });
    }
    static __editTasksProjectId(ids, projectId) {
        const _super = Object.create(null, {
            __updateTasksProjectId: { get: () => super.__updateTasksProjectId }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield _super.__updateTasksProjectId.call(this, projectId, ids);
                return result;
            }
            catch (error) {
                logger_1.default.error({ __updateTasksProjectId: error });
            }
        });
    }
    static getTasksCSV(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let csvData = yield Task_1.default.getTasksAsCSV(data);
                if (csvData) {
                    let root = __dirname.split("/controllers")[0].concat("/uploads/");
                    let fileName = `tasksSatatistics-${(0, crypto_1.randomUUID)()}.csv`;
                    (0, fs_1.writeFile)(root + fileName, csvData.toString(), { encoding: "utf8" }, () => { });
                    return { fileName, root, csvData };
                }
            }
            catch (error) {
                logger_1.default.error({ _getTasksCsv: error });
            }
        });
    }
}
exports.default = TaskController;
