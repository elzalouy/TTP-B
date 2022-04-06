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
const TaskController = class TaskController extends tasks_1.default {
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
                    cardId,
                }, {
                    status,
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
                // This action fro removing card
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
                if (targetList.includes(data.action.display.listAfter.text)) {
                    targetTask = yield tasks_1.default.updateOneTaskDB({
                        cardId: data.action.display.entities.card.id,
                    }, {
                        status: data.action.display.listAfter.text,
                    });
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
};
exports.default = TaskController;
