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
const Department_1 = __importDefault(require("../models/Department"));
const validation_1 = require("../services/validation");
const task_1 = __importDefault(require("./task"));
const Project_1 = __importDefault(require("../models/Project"));
const index_1 = require("../../index");
const trello_1 = __importDefault(require("./trello"));
const logger_1 = __importDefault(require("../../logger"));
class TrelloWebhook {
    constructor(action, target) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        this.hookTarget = target;
        this.type = (_a = action.action) === null || _a === void 0 ? void 0 : _a.type;
        this.action = (_c = (_b = action.action) === null || _b === void 0 ? void 0 : _b.display) === null || _c === void 0 ? void 0 : _c.translationKey;
        this.actionRequest = action;
        this.user = {
            id: (_e = (_d = action === null || action === void 0 ? void 0 : action.action) === null || _d === void 0 ? void 0 : _d.memberCreator) === null || _e === void 0 ? void 0 : _e.id,
            name: (_g = (_f = action === null || action === void 0 ? void 0 : action.action) === null || _f === void 0 ? void 0 : _f.memberCreator) === null || _g === void 0 ? void 0 : _g.fullName,
        };
        this.task = {
            cardId: (_k = (_j = (_h = action.action) === null || _h === void 0 ? void 0 : _h.data) === null || _j === void 0 ? void 0 : _j.card) === null || _k === void 0 ? void 0 : _k.id,
            name: (_o = (_m = (_l = action.action) === null || _l === void 0 ? void 0 : _l.data) === null || _m === void 0 ? void 0 : _m.card) === null || _o === void 0 ? void 0 : _o.name,
            boardId: (_r = (_q = (_p = action.action) === null || _p === void 0 ? void 0 : _p.data) === null || _q === void 0 ? void 0 : _q.board) === null || _r === void 0 ? void 0 : _r.id,
        };
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.hookTarget === "task")
                switch (this.type) {
                    case "addAttachmentToCard":
                        return yield this.addAttachmentToCard();
                    case "deleteAttachmentFromCard":
                        return yield this.deleteAttachmentFromCard();
                    case "createCard":
                        return yield this.createCard();
                    case "copyCard":
                        return yield this.createCard();
                    case "deleteCard":
                        return yield this.deleteCard();
                    case "updateCard":
                        return yield this.updateCard();
                    case "moveCardToBoard":
                        return yield this.updateCard();
                    default:
                        break;
                }
            else if (this.hookTarget === "project") {
                switch (this.type) {
                    case "createCard":
                        return yield this.createProject();
                    case "deleteCard":
                        return yield this.deleteProject();
                    case "updateCard":
                        return yield this.updateProject();
                    default:
                        break;
                }
            }
        });
    }
    addAttachmentToCard() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            let task = yield task_1.default.getOneTaskBy({
                cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
            });
            if (task) {
                this.task = Object.assign({}, task);
                this.task.attachedFile = {
                    trelloId: (_f = (_e = this.actionRequest.action.data) === null || _e === void 0 ? void 0 : _e.attachment) === null || _f === void 0 ? void 0 : _f.id,
                    name: (_h = (_g = this.actionRequest.action.data) === null || _g === void 0 ? void 0 : _g.attachment) === null || _h === void 0 ? void 0 : _h.name,
                    url: (_j = this.actionRequest.action.data.attachment) === null || _j === void 0 ? void 0 : _j.url,
                    mimeType: (0, validation_1.validateExtentions)((_l = (_k = this.actionRequest.action.data) === null || _k === void 0 ? void 0 : _k.attachment) === null || _l === void 0 ? void 0 : _l.name),
                };
                return yield task_1.default.updateTaskByTrelloDB(this.task, this.user);
            }
        });
    }
    deleteAttachmentFromCard() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            let task = yield task_1.default.getOneTaskBy({
                cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
            });
            if (task) {
                this.task = Object.assign({}, task);
                this.task.deleteFiles = {
                    trelloId: this.actionRequest.action.data.attachment.id,
                    name: this.actionRequest.action.data.attachment.name,
                };
                return yield task_1.default.updateTaskByTrelloDB(this.task, this.user);
            }
        });
    }
    createCard() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let listId = (_f = (_c = (_b = (_a = this.actionRequest.action.data) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_e = (_d = this.actionRequest.action.data) === null || _d === void 0 ? void 0 : _d.card) === null || _e === void 0 ? void 0 : _e.idList) !== null && _f !== void 0 ? _f : (_h = (_g = this.actionRequest.action.data) === null || _g === void 0 ? void 0 : _g.listAfter) === null || _h === void 0 ? void 0 : _h.id;
                let task = yield task_1.default.getOneTaskBy({
                    cardId: (_m = (_l = (_k = (_j = this.actionRequest) === null || _j === void 0 ? void 0 : _j.action) === null || _k === void 0 ? void 0 : _k.data) === null || _l === void 0 ? void 0 : _l.card) === null || _m === void 0 ? void 0 : _m.id,
                });
                let dep = yield Department_1.default.findOne({
                    boardId: (_p = (_o = this.actionRequest.action.data) === null || _o === void 0 ? void 0 : _o.board) === null || _p === void 0 ? void 0 : _p.id,
                });
                let isSideList = (_q = dep === null || dep === void 0 ? void 0 : dep.sideLists) === null || _q === void 0 ? void 0 : _q.find((item) => item.listId === listId);
                let team = yield dep.teams.find((item) => listId === item.listId);
                if (!task && dep) {
                    this.task = Object.assign(Object.assign({}, this.task), { trelloShortUrl: `https://trello.com/c/${this.actionRequest.action.data.card.shortLink}`, deadline: ((_t = (_s = (_r = this.actionRequest.action) === null || _r === void 0 ? void 0 : _r.data) === null || _s === void 0 ? void 0 : _s.card) === null || _t === void 0 ? void 0 : _t.due)
                            ? new Date((_w = (_v = (_u = this.actionRequest.action) === null || _u === void 0 ? void 0 : _u.data) === null || _v === void 0 ? void 0 : _v.card) === null || _w === void 0 ? void 0 : _w.due)
                            : undefined, start: ((_z = (_y = (_x = this.actionRequest.action) === null || _x === void 0 ? void 0 : _x.data) === null || _y === void 0 ? void 0 : _y.card) === null || _z === void 0 ? void 0 : _z.start)
                            ? new Date((_2 = (_1 = (_0 = this.actionRequest.action) === null || _0 === void 0 ? void 0 : _0.data) === null || _1 === void 0 ? void 0 : _1.card) === null || _2 === void 0 ? void 0 : _2.start)
                            : new Date(Date.now()), teamId: (_3 = team === null || team === void 0 ? void 0 : team._id) !== null && _3 !== void 0 ? _3 : null, status: team
                            ? "In Progress"
                            : isSideList
                                ? "Tasks Board"
                                : this.actionRequest.action.data.list.name, listId: listId, movements: [
                            {
                                status: team
                                    ? "In Progress"
                                    : isSideList
                                        ? "Tasks Board"
                                        : this.actionRequest.action.data.list.name,
                                movedAt: new Date(Date.now()).toString(),
                            },
                        ], assignedAt: team && ((_7 = (_6 = (_5 = (_4 = this.actionRequest) === null || _4 === void 0 ? void 0 : _4.action) === null || _5 === void 0 ? void 0 : _5.data) === null || _6 === void 0 ? void 0 : _6.listBefore) === null || _7 === void 0 ? void 0 : _7.id)
                            ? new Date(Date.now())
                            : this.task.assignedAt, archivedCard: (_9 = (_8 = this.actionRequest.action.data.card) === null || _8 === void 0 ? void 0 : _8.closed) !== null && _9 !== void 0 ? _9 : false });
                    return yield task_1.default.createTaskByTrello(this.task);
                }
            }
            catch (error) {
                logger_1.default.error({ createCardHook: error });
            }
        });
    }
    deleteCard() {
        var _a, _b, _c, _d;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.getOneTaskBy({
                    cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
                });
                if (task)
                    return yield task_1.default.deleteTaskByTrelloDB(task);
                else
                    return null;
            }
            catch (error) {
                logger_1.default.error({ deleteCardHook: error });
            }
        });
    }
    updateCard() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info({
                    action: this.actionRequest.action.display.translationKey,
                    cardId: this.task.cardId,
                });
                let action = this.actionRequest.action.display.translationKey;
                let isNewJourney, task, department, listId, isMoved, status, newDep, isNewTeam, inProgressList, isProject, sideList, listBefore, listAfter, cardDeadline;
                task = yield task_1.default.getOneTaskBy({
                    cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
                });
                if (task) {
                    department = yield Department_1.default.findOne({
                        boardId: task.boardId,
                    });
                    listId =
                        (_k = (_g = (_f = (_e = this.actionRequest.action.data) === null || _e === void 0 ? void 0 : _e.list) === null || _f === void 0 ? void 0 : _f.id) !== null && _g !== void 0 ? _g : (_j = (_h = this.actionRequest.action.data) === null || _h === void 0 ? void 0 : _h.card) === null || _j === void 0 ? void 0 : _j.idList) !== null && _k !== void 0 ? _k : (_m = (_l = this.actionRequest.action.data) === null || _l === void 0 ? void 0 : _l.listAfter) === null || _m === void 0 ? void 0 : _m.id;
                    isMoved = listId !== task.listId;
                    status =
                        (_q = (_p = (_o = this.actionRequest.action.data) === null || _o === void 0 ? void 0 : _o.list) === null || _p === void 0 ? void 0 : _p.name) !== null && _q !== void 0 ? _q : (_s = (_r = this.actionRequest.action.data) === null || _r === void 0 ? void 0 : _r.listAfter) === null || _s === void 0 ? void 0 : _s.name;
                    newDep =
                        (_t = (yield Department_1.default.findOne({
                            boardId: this.actionRequest.action.data.board.id,
                        }))) !== null && _t !== void 0 ? _t : null;
                    isNewTeam =
                        (_u = (newDep !== null && newDep !== void 0 ? newDep : department).teams.find((item) => item.listId === listId)) !== null && _u !== void 0 ? _u : null;
                    inProgressList = (newDep !== null && newDep !== void 0 ? newDep : department).lists.find((item) => (isNewTeam === null || isNewTeam === void 0 ? void 0 : isNewTeam.listId) && item.name === "In Progress");
                    isProject = (newDep !== null && newDep !== void 0 ? newDep : department).lists.find((l) => l.listId === listId && l.name === "projects");
                    sideList = (newDep !== null && newDep !== void 0 ? newDep : department).sideLists.find((list) => list.listId === listId);
                    listBefore = (_w = (_v = this.actionRequest.action.data.listBefore) === null || _v === void 0 ? void 0 : _v.name) !== null && _w !== void 0 ? _w : "";
                    listAfter = (_y = (_x = this.actionRequest.action.data.listAfter) === null || _x === void 0 ? void 0 : _x.name) !== null && _y !== void 0 ? _y : "";
                    isNewJourney =
                        (sideList || status === "Tasks Board") &&
                            ["Done", "Shared", "Cancled"].includes(listBefore);
                    cardDeadline = this.actionRequest.action.data.card.due
                        ? new Date(this.actionRequest.action.data.card.due)
                        : task.deadline;
                    let { movements, currentTeam } = yield trello_1.default.getActionsOfCard(task.cardId, yield Department_1.default.find({}), cardDeadline ? new Date(cardDeadline) : null);
                    if (!isProject) {
                        this.task = {
                            name: this.actionRequest.action.data.card.name,
                            boardId: this.actionRequest.action.data.board.id,
                            cardId: this.actionRequest.action.data.card.id,
                            deadline: isNewJourney ? null : cardDeadline,
                            start: ((_1 = (_0 = (_z = this.actionRequest.action) === null || _z === void 0 ? void 0 : _z.data) === null || _0 === void 0 ? void 0 : _0.card) === null || _1 === void 0 ? void 0 : _1.start)
                                ? new Date((_4 = (_3 = (_2 = this.actionRequest.action) === null || _2 === void 0 ? void 0 : _2.data) === null || _3 === void 0 ? void 0 : _3.card) === null || _4 === void 0 ? void 0 : _4.start)
                                : (_5 = task.start) !== null && _5 !== void 0 ? _5 : null,
                            description: (_6 = this.actionRequest.action.data.card.desc) !== null && _6 !== void 0 ? _6 : task.description,
                            teamId: (_8 = (_7 = isNewTeam === null || isNewTeam === void 0 ? void 0 : isNewTeam._id) !== null && _7 !== void 0 ? _7 : task.teamId) !== null && _8 !== void 0 ? _8 : currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam._id,
                            listId: listId,
                            status: sideList
                                ? "Tasks Board"
                                : (inProgressList === null || inProgressList === void 0 ? void 0 : inProgressList.name)
                                    ? inProgressList.name
                                    : status,
                            movements: action === "action_sent_card_to_board"
                                ? movements
                                : task.movements,
                            teamListId: isNewTeam ? listId : task.teamListId,
                            archivedCard: this.actionRequest.action.data.card.closed,
                            projectId: task.projectId,
                        };
                        if ((isMoved || task.movements.length === 0) &&
                            action !== "action_sent_card_to_board") {
                            let move = {
                                status: sideList
                                    ? "Tasks Board"
                                    : (inProgressList === null || inProgressList === void 0 ? void 0 : inProgressList.name)
                                        ? inProgressList.name
                                        : status,
                                movedAt: new Date(Date.now()).toString(),
                            };
                            if (["Done", "Shared", "Cancled"].includes(listAfter))
                                move.journeyDeadline = cardDeadline
                                    ? new Date(cardDeadline).toDateString()
                                    : null;
                            this.task.movements.push(move);
                        }
                        return yield task_1.default.updateTaskByTrelloDB(this.task, {
                            id: this.user.id,
                            name: (_9 = this.user) === null || _9 === void 0 ? void 0 : _9.name,
                        });
                    }
                    else
                        this.updateProject();
                }
                else
                    this.updateProject();
            }
            catch (error) {
                logger_1.default.error({ updateCardHook: error });
            }
        });
    }
    createProject() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let existed = yield Project_1.default.find({
                    cardId: this.actionRequest.action.data.card.id,
                });
                if (existed)
                    return yield this.updateProject();
                else {
                    yield trello_1.default.deleteCard(this.actionRequest.action.data.card.id);
                }
            }
            catch (error) {
                logger_1.default.error({ createProjectHook: error });
            }
        });
    }
    updateProject() {
        try {
            Department_1.default.findOne({
                boardId: this.actionRequest.action.data.board.id,
            }).then((creativeBoard) => __awaiter(this, void 0, void 0, function* () {
                if (creativeBoard) {
                    // if true, then it's an update action, and if not so it's a move action and moving is not allowed
                    let project = yield Project_1.default.findOneAndUpdate({ cardId: this.actionRequest.action.data.card.id }, {
                        boardId: this.actionRequest.action.data.board.id,
                        listId: this.actionRequest.action.data.card.idList,
                        cardId: this.actionRequest.action.data.card.id,
                        name: this.actionRequest.action.data.card.name,
                        projectDeadline: this.actionRequest.action.data.card.due,
                        startDate: this.actionRequest.action.data.card.start,
                    }, { new: true });
                    index_1.io.sockets.emit("update-projects", project);
                }
            }));
        }
        catch (error) {
            logger_1.default.error({ updateProjectHook: error });
        }
    }
    deleteProject() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // when deleting from ttp, we must make sure that it is working in async with the trello deletion process.
                let data = this.actionRequest.action.data.card;
                let project = yield Project_1.default.findOne({ cardId: data.id });
                if (project) {
                    yield trello_1.default.__createProject(this.actionRequest.action.data.list.id, {
                        name: project.name,
                        projectDeadline: project.projectDeadline,
                        startDate: project.startDate,
                    }).then(({ id }) => __awaiter(this, void 0, void 0, function* () {
                        project.cardId = id;
                        project.boardId = this.actionRequest.action.data.board.id;
                        project.listId = data.idList;
                        let result = yield project.save();
                        index_1.io.sockets.emit("update-projects", result);
                    }));
                }
            }
            catch (error) {
                logger_1.default.error({ deleteProjectHook: error });
            }
        });
    }
}
exports.default = TrelloWebhook;
