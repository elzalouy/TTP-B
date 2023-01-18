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
        try {
            let currentTask = yield task_1.default.getOneTaskBy({ cardId: cardId });
            if (currentTask) {
                let inProgressList = department.lists.find((item) => item.name === "In Progress");
                let team = department.teams.find((item) => { var _a; return ((_a = currentTask === null || currentTask === void 0 ? void 0 : currentTask.teamId) === null || _a === void 0 ? void 0 : _a.toString()) === item._id; });
                const result = yield trello_1.default.moveTaskToDiffList(cardId, listId === inProgressList.listId.toString() && team
                    ? team.listId
                    : listId);
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
const updateCardJob = (data, newFiles) => {
    const deleteFiles = data.deleteFiles
        ? data.deleteFiles
        : [];
    delete data.deleteFiles;
    delete data.attachedFiles;
    exports.updateTaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        try {
            let current = yield task_1.default.__getTask(data.id);
            let dep = yield Department_1.default.findOne({ boardId: data.boardId });
            logger_1.default.info({ data });
            let isTeamChanged = current.teamId &&
                data.teamId &&
                ((_a = current === null || current === void 0 ? void 0 : current.teamId) === null || _a === void 0 ? void 0 : _a.toString()) !== data.teamId.toString();
            let newTeamListId = isTeamChanged && dep && dep.teams
                ? dep.teams.find((item) => item._id.toString() === data.teamId.toString()).listId
                : null;
            let taskData = {
                name: data.name,
                idBoard: data.boardId,
                idList: isTeamChanged === true
                    ? newTeamListId
                    : data.teamId && data.status === "In Progress"
                        ? newTeamListId
                        : data.listId,
                due: data.deadline ? data.deadline : null,
                start: data.start ? data.start : null,
                desc: data.description ? data.description : "",
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
            // wait for both update data in db and upload,delete files to trello
            // if there are deleted files, then delete it from the db
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
        let task = yield task_1.default.updateTaskDB(data);
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
