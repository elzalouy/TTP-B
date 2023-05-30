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
exports.updateTaskAttachmentsJob = exports.deleteTaskFromBoardJob = exports.updateCardJob = exports.moveTaskJob = exports.updateTaskQueue = exports.createTaskQueue = void 0;
const queue_1 = __importDefault(require("queue"));
const logger_1 = __importDefault(require("../../../logger"));
const trello_1 = __importDefault(require("../../controllers/trello"));
const notification_1 = __importDefault(require("../../controllers/notification"));
const tasks_1 = __importDefault(require("../../dbCalls/tasks/tasks"));
const index_1 = require("../../../index");
const task_1 = __importDefault(require("../../controllers/task"));
const upload_1 = require("../../services/upload");
const Department_1 = __importDefault(require("../../models/Department"));
exports.createTaskQueue = (0, queue_1.default)({
    results: [],
    autostart: true,
    concurrency: 1,
});
exports.updateTaskQueue = (0, queue_1.default)({
    results: [],
    autostart: true,
    concurrency: 1,
});
function moveTaskJob(listId, cardId, status, department, user) {
    var task;
    exports.updateTaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            let currentTask = yield task_1.default.getOneTaskBy({ cardId: cardId });
            if (currentTask) {
                let teamList = department.teams.find((item) => item.listId === listId);
                let statusList = department.lists.find((item) => item.listId === listId);
                const result = yield trello_1.default.moveTaskToDiffList(cardId, (_a = teamList === null || teamList === void 0 ? void 0 : teamList.listId) !== null && _a !== void 0 ? _a : statusList === null || statusList === void 0 ? void 0 : statusList.listId);
                console.log({ moveResult: result });
                cb(null);
            }
        }
        catch (error) {
            logger_1.default.error({ moveTaskJobError: error });
        }
    }));
    exports.updateTaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (status === "Shared" || status === "Not Clear") {
                task = yield tasks_1.default.getOneTaskBy({ cardId: cardId });
                yield notification_1.default.__MoveTaskNotification(task, status, user);
            }
            cb(null);
        }
        catch (error) {
            cb(new Error(error), null);
            logger_1.default.ercror({ webHookUpdateMoveTaskJobError: error });
        }
    }));
}
exports.moveTaskJob = moveTaskJob;
const updateCardJob = (data, newFiles, tokenUser) => {
    const deleteFiles = data.deleteFiles
        ? data.deleteFiles
        : [];
    delete data.deleteFiles;
    delete data.attachedFiles;
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g;
        try {
            let current = yield task_1.default.__getTask(data.id);
            let dep = yield Department_1.default.findOne({ boardId: data.boardId });
            let teamListId = dep.teams.find((item) => item.listId === data.listId);
            let statusListId = dep.lists.find((item) => item.listId === data.listId);
            let taskData = {
                name: data.name,
                idBoard: data.boardId,
                idList: (_b = (_a = teamListId === null || teamListId === void 0 ? void 0 : teamListId.listId) !== null && _a !== void 0 ? _a : statusListId === null || statusListId === void 0 ? void 0 : statusListId.listId) !== null && _b !== void 0 ? _b : current.listId,
                due: (_d = (_c = data === null || data === void 0 ? void 0 : data.deadline) !== null && _c !== void 0 ? _c : current === null || current === void 0 ? void 0 : current.deadline) !== null && _d !== void 0 ? _d : null,
                start: (_f = (_e = data === null || data === void 0 ? void 0 : data.start) !== null && _e !== void 0 ? _e : current === null || current === void 0 ? void 0 : current.start) !== null && _f !== void 0 ? _f : null,
                desc: (_g = data === null || data === void 0 ? void 0 : data.description) !== null && _g !== void 0 ? _g : "",
            };
            let response = yield trello_1.default.__updateCard({
                cardId: data.cardId,
                data: taskData,
            });
            cb(null, response);
        }
        catch (error) {
            cb(error, null);
            logger_1.default.ercror({ updateCardDataError: error });
        }
    }));
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (deleteFiles) {
                if (deleteFiles.length > 0) {
                    let isDeletedAll = yield (deleteFiles === null || deleteFiles === void 0 ? void 0 : deleteFiles.map((item) => __awaiter(void 0, void 0, void 0, function* () {
                        return yield trello_1.default.__deleteAtachment(data.cardId, item.trelloId);
                    })));
                    let isDeletedResullt = Promise.resolve(isDeletedAll);
                    cb(null, isDeletedResullt);
                }
            }
        }
        catch (error) {
            cb(error, null);
            logger_1.default.error({ updateCardDeleteFilesJobError: error });
        }
    }));
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        if (newFiles) {
            yield task_1.default.__createTaskAttachment(newFiles, data);
        }
        cb(null, true);
    }));
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        let task = yield task_1.default.updateTaskDB(data, tokenUser);
        if (task.error)
            cb(new Error(task.error.message), null);
        yield index_1.io.sockets.emit("update-task", task.task);
        (0, upload_1.deleteAll)();
        cb(null, task);
    }));
};
exports.updateCardJob = updateCardJob;
const deleteTaskFromBoardJob = (data) => {
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            index_1.io.sockets.emit("delete-task", data);
            cb(null, data);
        }
        catch (error) {
            logger_1.default.ercror({ deleteCardDataError: error });
        }
    }));
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield trello_1.default.removeWebhook(data.cardId);
        }
        catch (error) {
            logger_1.default.ercror({ deleteCardWebhookError: error });
        }
    }));
};
exports.deleteTaskFromBoardJob = deleteTaskFromBoardJob;
const updateTaskAttachmentsJob = (task) => {
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let attachments = yield trello_1.default.__getCardAttachments(task.cardId);
            let newfiles = attachments.map((item) => {
                let file = {
                    trelloId: item.id,
                    mimeType: item.mimeType,
                    name: item.name,
                    url: item.url,
                };
                return file;
            });
            let Task = yield tasks_1.default.__updateTaskAttachments(task, newfiles);
            index_1.io.sockets.emit("update-task", Task);
        }
        catch (error) {
            logger_1.default.ercror({ updateTaskAttachmentsError: error });
        }
    }));
};
exports.updateTaskAttachmentsJob = updateTaskAttachmentsJob;
