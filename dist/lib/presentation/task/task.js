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
const errorUtils_1 = require("./../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const task_1 = __importDefault(require("../../controllers/task"));
const validation_1 = require("../../db/validation");
const TaskReq = class TaskReq extends task_1.default {
    static handleCreateCard(req, res) {
        const _super = Object.create(null, {
            createTask: { get: () => super.createTask }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let TaskData = req.body;
                let isValid = validation_1.createTaskSchema.validate(TaskData);
                if (isValid.error)
                    return res.status(400).send(isValid.error.details);
                let task = yield _super.createTask.call(this, TaskData, req.files);
                if (task) {
                    return res.send(task);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_task_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleCreateCardError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleUpdateCard(req, res) {
        const _super = Object.create(null, {
            updateTask: { get: () => super.updateTask }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let TaskData = req.body;
                // TaskData.file = req.file
                let task = yield _super.updateTask.call(this, TaskData);
                if (task) {
                    return res.send(task);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_task_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateCardError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleWebhookUpdateCard(req, res) {
        const _super = Object.create(null, {
            webhookUpdate: { get: () => super.webhookUpdate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let trelloData = req.body;
                let task = yield _super.webhookUpdate.call(this, trelloData);
                return res.status(200).send(task);
            }
            catch (error) {
                logger_1.default.error({ handleWebhookUpdateCardError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetTasks(req, res) {
        const _super = Object.create(null, {
            getTasks: { get: () => super.getTasks }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = req.query;
                let tasks = yield _super.getTasks.call(this, data);
                if (tasks)
                    return res.status(200).send(tasks);
                else
                    res.status(400).send((0, errorUtils_1.customeError)("get_tasks_error", 400));
            }
            catch (error) {
                logger_1.default.error({ handleGetTasksError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleFilterTasks(req, res) {
        const _super = Object.create(null, {
            filterTasks: { get: () => super.filterTasks }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = req.body;
                let tasks = yield _super.filterTasks.call(this, data);
                if (tasks)
                    return res.status(200).send(tasks);
                else
                    res.status(400).send((0, errorUtils_1.customeError)("get_tasks_error", 400));
            }
            catch (error) {
                logger_1.default.error({ handleGetTasksError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleMoveCard(req, res) {
        const _super = Object.create(null, {
            moveTaskOnTrello: { get: () => super.moveTaskOnTrello }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { cardId, listId, status } = req.body;
                let task = yield _super.moveTaskOnTrello.call(this, cardId, listId, status);
                if (task) {
                    return res.send(task);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_task_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleMoveCardError: error });
            }
        });
    }
    static handleDeleteTasksByProjectId(req, res) {
        const _super = Object.create(null, {
            deleteTasksByProjectId: { get: () => super.deleteTasksByProjectId }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.body.id;
                let deleteResult = yield _super.deleteTasksByProjectId.call(this, id);
                if (deleteResult === null || deleteResult === void 0 ? void 0 : deleteResult.deletedCount)
                    return res.status(200).send(deleteResult);
            }
            catch (error) {
                logger_1.default.error({ handleDeleteTasksByProjectIdError: error });
            }
        });
    }
    static handleDeleteTasks(req, res) {
        const _super = Object.create(null, {
            deleteTasks: { get: () => super.deleteTasks }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ids = req.body.ids;
                let deleteResult = yield _super.deleteTasks.call(this, ids);
                if (deleteResult)
                    return res.status(200).send(deleteResult);
                else
                    res.status(400).send((0, errorUtils_1.customeError)("delete_task_error", 400));
            }
            catch (error) {
                logger_1.default.error({ handleDeleteTasksError: error });
            }
        });
    }
    static handleDeleteTask(req, res) {
        const _super = Object.create(null, {
            deleteTask: { get: () => super.deleteTask }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = req.body.id;
                let deleteResult = yield _super.deleteTask.call(this, id);
                if (deleteResult._id)
                    return res.status(200).send(deleteResult);
                else
                    res.status(400).send((0, errorUtils_1.customeError)("delete_task_error", 400));
            }
            catch (error) {
                logger_1.default.error({ handleDeleteTasksError: error });
            }
        });
    }
};
exports.default = TaskReq;
