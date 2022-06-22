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
const validation_1 = require("../../services/validation");
const TaskReq = class TaskReq extends task_1.default {
    static handleCreateCard(req, res) {
        const _super = Object.create(null, {
            createTask: { get: () => super.createTask }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let TaskData = req.body;
                if (TaskData.teamId === "")
                    TaskData.teamId = null;
                let isValid = validation_1.createTaskSchema.validate(TaskData);
                if (isValid.error)
                    return res.status(400).send(isValid.error.details[0]);
                let task = yield _super.createTask.call(this, TaskData, req.files);
                if (task) {
                    return res.send(task);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("create_task_error", 400));
                }
            }
            catch (error) {
                console.log(new Error(error).message);
                logger_1.default.error({ handleCreateCardError: error });
            }
        });
    }
    static handleUpdateCard(req, res) {
        const _super = Object.create(null, {
            updateTask: { get: () => super.updateTask }
        });
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let TaskData = req.body;
                if (TaskData.teamId === "" || TaskData.teamId === null)
                    TaskData.teamId = null;
                let files = req.files;
                let validate = validation_1.editTaskSchema.validate(TaskData);
                if (validate.error)
                    return res.status(400).send(validate.error.details[0]);
                let task = yield _super.updateTask.call(this, TaskData, files);
                if (task && (task === null || task === void 0 ? void 0 : task.error))
                    res.status(400).send(task.error);
                if ((_a = task === null || task === void 0 ? void 0 : task.task) === null || _a === void 0 ? void 0 : _a._id) {
                    return res.send(task.task);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("update_task_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleUpdateCardError: error });
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
            }
        });
    }
    static handleMoveCard(req, res) {
        const _super = Object.create(null, {
            moveTaskOnTrello: { get: () => super.moveTaskOnTrello }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { cardId, listId, status, list } = req.body;
                let task = yield _super.moveTaskOnTrello.call(this, cardId, listId, status, list);
                if (task === null || task === void 0 ? void 0 : task.error)
                    return res.status(400).send(task === null || task === void 0 ? void 0 : task.message);
                return res.send(task);
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
    static handleDownloadAttachment(req, res) {
        const _super = Object.create(null, {
            downloadAttachment: { get: () => super.downloadAttachment }
        });
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cardId = (_a = req.query) === null || _a === void 0 ? void 0 : _a.cardId.toString();
                let attachmentId = (_b = req.query) === null || _b === void 0 ? void 0 : _b.attachmentId.toString();
                if (cardId && attachmentId) {
                    let result = yield _super.downloadAttachment.call(this, cardId, attachmentId);
                    if (result)
                        return res.send(result);
                    return res.status(400).send("Bad Request for downlaoding this file");
                }
                else
                    res.status(400).send("Request values missed cardId and AttachmentId");
            }
            catch (error) {
                logger_1.default.error({ handleDownloadAttachmentError: error });
            }
        });
    }
};
exports.default = TaskReq;
