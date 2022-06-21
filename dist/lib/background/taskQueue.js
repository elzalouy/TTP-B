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
exports.updateCardJob = exports.webhookUpdateMoveTaskJob = exports.moveTaskJob = exports.TaskQueue = void 0;
const queue_1 = __importDefault(require("queue"));
const logger_1 = __importDefault(require("../../logger"));
const trello_1 = __importDefault(require("../controllers/trello"));
const notification_1 = __importDefault(require("../controllers/notification"));
const project_1 = __importDefault(require("../dbCalls/project/project"));
const tasks_1 = __importDefault(require("../dbCalls/tasks/tasks"));
const server_1 = require("../server");
exports.TaskQueue = (0, queue_1.default)({ results: [] });
function moveTaskJob(listId, cardId, status) {
    exports.TaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield trello_1.default.moveTaskToDiffList(cardId, listId);
            cb(null, { message: "move in trello" });
        }
        catch (error) {
            logger_1.default.error({ moveTaskJobError: error });
        }
    }));
    exports.TaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
        try {
            let task = yield tasks_1.default.updateTaskStatus({
                cardId: cardId,
            }, {
                status: status,
                listId: listId,
            });
            cb(null, task);
        }
        catch (error) {
            cb(new Error(error), null);
        }
    }));
}
exports.moveTaskJob = moveTaskJob;
const webhookUpdateMoveTaskJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        try {
            const targetList = [
                "Tasks Board",
                "Done",
                "Shared",
                "Review",
                "Not Clear",
                "Cancled",
                "inProgress",
            ];
            let targetTask;
            if (targetList.includes((_d = (_c = (_b = (_a = data === null || data === void 0 ? void 0 : data.action) === null || _a === void 0 ? void 0 : _a.display) === null || _b === void 0 ? void 0 : _b.entities) === null || _c === void 0 ? void 0 : _c.listAfter) === null || _d === void 0 ? void 0 : _d.text)) {
                targetTask = yield tasks_1.default.updateTaskStatus({
                    cardId: data.action.display.entities.card.id,
                }, {
                    status: (_h = (_g = (_f = (_e = data === null || data === void 0 ? void 0 : data.action) === null || _e === void 0 ? void 0 : _e.display) === null || _f === void 0 ? void 0 : _f.entities) === null || _g === void 0 ? void 0 : _g.listAfter) === null || _h === void 0 ? void 0 : _h.text,
                });
                // if task status update to shared send notification
                if (((_m = (_l = (_k = (_j = data === null || data === void 0 ? void 0 : data.action) === null || _j === void 0 ? void 0 : _j.display) === null || _k === void 0 ? void 0 : _k.entities) === null || _l === void 0 ? void 0 : _l.listAfter) === null || _m === void 0 ? void 0 : _m.text) === "Shared") {
                    let projectData = yield project_1.default.getProjectDB({
                        _id: targetTask.projectId,
                    });
                    let userName = (_r = (_q = (_p = (_o = data === null || data === void 0 ? void 0 : data.action) === null || _o === void 0 ? void 0 : _o.display) === null || _p === void 0 ? void 0 : _p.entities) === null || _q === void 0 ? void 0 : _q.memberCreator) === null || _r === void 0 ? void 0 : _r.username;
                    let cardName = (_v = (_u = (_t = (_s = data === null || data === void 0 ? void 0 : data.action) === null || _s === void 0 ? void 0 : _s.display) === null || _t === void 0 ? void 0 : _t.entities) === null || _u === void 0 ? void 0 : _u.card) === null || _v === void 0 ? void 0 : _v.text;
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
        }
        catch (error) {
            cb(new Error(error), null);
            logger_1.default.ercror({ webHookUpdateMoveTaskJobError: error });
        }
    }));
};
exports.webhookUpdateMoveTaskJob = webhookUpdateMoveTaskJob;
const updateCardJob = (data) => {
    exports.TaskQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            let response = yield trello_1.default.__updateCard(data.cardId, {
                name: data.name,
                desc: (data === null || data === void 0 ? void 0 : data.description) ? data === null || data === void 0 ? void 0 : data.description : "",
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
