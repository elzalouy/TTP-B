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
exports.updateTaskAttachmentsJob = exports.deleteTaskFromBoardJob = exports.createTaskFromBoardJob = exports.updateCardJob = exports.moveTaskNotificationJob = exports.moveTaskJob = exports.updateTaskQueue = exports.TaskQueue = void 0;
const queue_1 = __importDefault(require("queue"));
const logger_1 = __importDefault(require("../../logger"));
const trello_1 = __importDefault(require("../controllers/trello"));
const notification_1 = __importDefault(require("../controllers/notification"));
const tasks_1 = __importDefault(require("../dbCalls/tasks/tasks"));
const index_1 = require("../../index");
exports.TaskQueue = (0, queue_1.default)({ results: [] });
exports.updateTaskQueue = (0, queue_1.default)({ results: [], autostart: true });
function moveTaskJob(listId, cardId, status, user) {
    var task;
    exports.TaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield trello_1.default.moveTaskToDiffList(cardId, listId);
            cb(null, { message: "move in trello" });
        }
        catch (error) {
            logger_1.default.error({ moveTaskJobError: error });
        }
    }));
    // TaskQueue.push(async (cb) => {
    //   try {
    //     task = await TaskDB.updateTaskStatus(
    //       {
    //         cardId: cardId,
    //       },
    //       {
    //         status: status,
    //         listId: listId,
    //       }
    //     );
    //     // io.sockets.emit("update-task", task);
    //     cb(null, task);
    //   } catch (error: any) {
    //     cb(new Error(error), null);
    //   }
    // });
    exports.TaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            if (status === "Shared" || status === "Not Clear") {
                console.log(`move task ${cardId} to ${status}`);
                task = yield tasks_1.default.getOneTaskBy({ cardId: cardId });
                yield notification_1.default.__MoveTaskNotification(task, status, user);
            }
        }
        catch (error) {
            cb(new Error(error), null);
            logger_1.default.ercror({ webHookUpdateMoveTaskJobError: error });
        }
    }));
}
exports.moveTaskJob = moveTaskJob;
const moveTaskNotificationJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            let to = (_b = (_a = data.action.data) === null || _a === void 0 ? void 0 : _a.listAfter) === null || _b === void 0 ? void 0 : _b.name;
            // if task status update to shared send notification
            if (data.action.display.translationKey ===
                "action_move_card_from_list_to_list") {
                // let task = await TaskDB.getOneTaskBy({ cardId: data.model.id });
                // await NotificationController.__MoveTaskNotification(task, status, user);
                // if (to === "Shared" || to === "Not Clear") {
                //   let createNotifi = await NotificationController.createNotification({
                //     title: `${cardName} status has been changed to ${to}`,
                //     description: `${cardName} status has been changed to ${to} by ${userName}`,
                //     projectManagerID: projectData.projectManager,
                //     projectID: targetTask.projectId,
                //     adminUserID: projectData.adminId,
                //   });
                //   // send notification to all the admin
                //   io.to("admin-room").emit("notification-update", createNotifi);
                //   // send notification to specific project manager
                //   io.to(`user-${projectData.projectManager}`).emit(
                //     "notification-update",
                //     createNotifi
                //   );
                // }
            }
        }
        catch (error) {
            cb(new Error(error), null);
            logger_1.default.ercror({ webHookUpdateMoveTaskJobError: error });
        }
    }));
};
exports.moveTaskNotificationJob = moveTaskNotificationJob;
const updateCardJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let response = yield trello_1.default.__updateCard(data.cardId, {
                name: data.name,
                desc: (data === null || data === void 0 ? void 0 : data.description) ? data === null || data === void 0 ? void 0 : data.description : "",
                idList: data === null || data === void 0 ? void 0 : data.listId,
                idBoard: data === null || data === void 0 ? void 0 : data.boardId,
            });
            cb(null, response);
        }
        catch (error) {
            cb(error, null);
            logger_1.default.ercror({ updateCardDataError: error });
        }
    }));
};
exports.updateCardJob = updateCardJob;
const createTaskFromBoardJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            index_1.io.sockets.emit("create-task", data);
            cb(null, data);
        }
        catch (error) {
            logger_1.default.ercror({ createCardDataError: error });
        }
    }));
};
exports.createTaskFromBoardJob = createTaskFromBoardJob;
const deleteTaskFromBoardJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            index_1.io.sockets.emit("delete-task", data);
            cb(null, data);
        }
        catch (error) {
            logger_1.default.ercror({ deleteCardDataError: error });
        }
    }));
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
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
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
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
            console.log("change task files to,", newfiles);
            let Task = yield tasks_1.default.__updateTaskAttachments(task, newfiles);
            index_1.io.sockets.emit("update-task", Task);
        }
        catch (error) {
            logger_1.default.ercror({ updateTaskAttachmentsError: error });
        }
    }));
};
exports.updateTaskAttachmentsJob = updateTaskAttachmentsJob;
