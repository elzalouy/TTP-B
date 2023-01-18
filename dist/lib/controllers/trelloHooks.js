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
const __1 = require("../..");
const trello_1 = __importDefault(require("./trello"));
const logger_1 = __importDefault(require("../../logger"));
class TrelloWebhook {
    constructor(action, target) {
        var _a, _b, _c;
        this.hookTarget = target;
        this.type = (_a = action.action) === null || _a === void 0 ? void 0 : _a.type;
        this.action = (_c = (_b = action.action) === null || _b === void 0 ? void 0 : _b.display) === null || _c === void 0 ? void 0 : _c.translationKey;
        this.actionRequest = action;
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
                    default:
                        logger_1.default.info({ noAction: this.actionRequest });
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
                        logger_1.default.info({ noAction: this.actionRequest });
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
                return yield task_1.default.updateTaskByTrelloDB(this.task);
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
                return yield task_1.default.updateTaskByTrelloDB(this.task);
            }
        });
    }
    createCard() {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.getOneTaskBy({
                    cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
                });
                let dep = yield Department_1.default.findOne({
                    boardId: (_f = (_e = this.actionRequest.action.data) === null || _e === void 0 ? void 0 : _e.board) === null || _f === void 0 ? void 0 : _f.id,
                });
                let team = yield dep.teams.find((item) => { var _a, _b; return ((_b = (_a = this.actionRequest.action.data) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.id) === item.listId; });
                if (!task && dep) {
                    this.task = {
                        cardId: this.actionRequest.action.data.card.id,
                        name: this.actionRequest.action.data.card.name,
                        boardId: this.actionRequest.action.data.board.id,
                        trelloShortUrl: `https://trello.com/c/${this.actionRequest.action.data.card.shortLink}`,
                        deadline: this.actionRequest.action.data.card.due
                            ? new Date(this.actionRequest.action.data.card.due)
                            : undefined,
                        start: this.actionRequest.action.data.card.start
                            ? new Date(this.actionRequest.action.data.card.start)
                            : undefined,
                        // check
                        teamId: team ? team._id : null,
                        status: team
                            ? "In Progress"
                            : this.actionRequest.action.data.list.name,
                        listId: team
                            ? dep.lists.find((item) => item.name === "In Progress").listId
                            : this.actionRequest.action.data.list.id,
                    };
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
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.getOneTaskBy({
                    cardId: (_d = (_c = (_b = (_a = this.actionRequest) === null || _a === void 0 ? void 0 : _a.action) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.id,
                });
                if (task) {
                    let department = yield Department_1.default.findOne({
                        boardId: task.boardId,
                    });
                    let isNewTeam = department.teams.find((item) => item.listId === this.actionRequest.action.data.card.idList);
                    let isBeforeTeam = department.teams.find((item) => { var _a, _b; return ((_b = (_a = this.actionRequest.action.data) === null || _a === void 0 ? void 0 : _a.listBefore) === null || _b === void 0 ? void 0 : _b.id) === item.listId; });
                    let inProgressList = department.lists.find((item) => item.name === "In Progress");
                    this.task = {
                        name: this.actionRequest.action.data.card.name,
                        boardId: this.actionRequest.action.data.board.id,
                        cardId: this.actionRequest.action.data.card.id,
                        deadline: this.actionRequest.action.data.card.due !== undefined
                            ? ((_g = (_f = (_e = this.actionRequest.action) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.card) === null || _g === void 0 ? void 0 : _g.due) === null
                                ? null
                                : new Date(this.actionRequest.action.data.card.due)
                            : task.deadline,
                        start: this.actionRequest.action.data.card.start
                            ? new Date(this.actionRequest.action.data.card.start)
                            : task.start
                                ? task.start
                                : undefined,
                        description: this.actionRequest.action.data.card.desc
                            ? this.actionRequest.action.data.card.desc
                            : task.description
                                ? task.description
                                : undefined,
                        lastMove: isBeforeTeam
                            ? task.lastMove
                            : (_j = (_h = this.actionRequest.action.data) === null || _h === void 0 ? void 0 : _h.listBefore) === null || _j === void 0 ? void 0 : _j.name,
                        lastMoveDate: isBeforeTeam
                            ? task.lastMoveDate
                            : new Date().toString(),
                        teamId: isNewTeam ? isNewTeam._id : task.teamId,
                        listId: isNewTeam
                            ? inProgressList.listId
                            : (_k = this.actionRequest.action.data.listAfter) === null || _k === void 0 ? void 0 : _k.id,
                        status: isNewTeam
                            ? inProgressList.name
                            : (_l = this.actionRequest.action.data.listAfter) === null || _l === void 0 ? void 0 : _l.name,
                    };
                    return yield task_1.default.updateTaskByTrelloDB(this.task);
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
                    console.log({ data: this.actionRequest.action.data.card });
                    // if true, then it's an update action, and if not so it's a move action and moving is not allowed
                    let project = yield Project_1.default.findOneAndUpdate({ cardId: this.actionRequest.action.data.card.id }, {
                        boardId: this.actionRequest.action.data.board.id,
                        listId: this.actionRequest.action.data.card.idList,
                        cardId: this.actionRequest.action.data.card.id,
                        name: this.actionRequest.action.data.card.name,
                        projectDeadline: this.actionRequest.action.data.card.due,
                        startDate: this.actionRequest.action.data.card.start,
                    }, { new: true });
                    __1.io.sockets.emit("update-projects", project);
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
                        __1.io.sockets.emit("update-projects", result);
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
