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
const errorUtils_1 = require("../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const trello_1 = __importDefault(require("../../controllers/trello"));
const tasks_Route_Queue_1 = require("../../backgroundJobs/routes/tasks.Route.Queue");
const BoardReq = class BoardReq extends trello_1.default {
    static handleGetBoards(req, res) {
        const _super = Object.create(null, {
            getBoardsInTrello: { get: () => super.getBoardsInTrello }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boards = yield _super.getBoardsInTrello.call(this, "all");
                if (boards) {
                    return res.send(boards);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("boards_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetMembers(req, res) {
        const _super = Object.create(null, {
            getMembersInTrello: { get: () => super.getMembersInTrello }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let members = yield _super.getMembersInTrello.call(this);
                if (members) {
                    return res.send(members);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("boards_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleGetBoardInfo(req, res) {
        const _super = Object.create(null, {
            getSingleBoardInfo: { get: () => super.getSingleBoardInfo }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const id = req.query.id;
                const type = req.query.type;
                let members = yield _super.getSingleBoardInfo.call(this, id);
                if (members) {
                    return res.send(members);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("boards_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleAddMember(req, res) {
        const _super = Object.create(null, {
            addMemberToBoard: { get: () => super.addMemberToBoard }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { boardId, memberId, type } = req.body;
                let member = yield _super.addMemberToBoard.call(this, boardId, memberId, type);
                if (member) {
                    return res.send(member);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("boards_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleAddList(req, res) {
        const _super = Object.create(null, {
            addListToBoard: { get: () => super.addListToBoard }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { boardId, listName } = req.body;
                let list = yield _super.addListToBoard.call(this, boardId, listName);
                if (list) {
                    return res.send(list);
                }
                else {
                    return res.status(400).send((0, errorUtils_1.customeError)("boards_error", 400));
                }
            }
            catch (error) {
                logger_1.default.error({ handleGetBoards: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static postSnapshotOfActionsFromTrello(req, res) {
        const _super = Object.create(null, {
            __postSnapshotOfActions: { get: () => super.__postSnapshotOfActions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let actionsByBoards = yield _super.__postSnapshotOfActions.call(this);
                return res.send(actionsByBoards);
            }
            catch (error) {
                logger_1.default.error({ getBackupCardsFromTrelloError: error });
            }
        });
    }
    static restoreNotExistedOnTrello(req, res) {
        const _super = Object.create(null, {
            restoreTrelloCards: { get: () => super.restoreTrelloCards }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                tasks_Route_Queue_1.taskRoutesQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
                    let { activities } = yield _super.restoreTrelloCards.call(this, req.params.id);
                }));
                res.send({ process: "Done" });
            }
            catch (error) {
                logger_1.default.error({ restoreNotExistedOnTrelloError: error });
            }
        });
    }
};
exports.default = BoardReq;
