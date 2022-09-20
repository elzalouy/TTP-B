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
const taskQueue_1 = require("../../background/taskQueue");
const BoardReq = class BoardReq extends trello_1.default {
    static handleGetBoards(req, res) {
        const _super = Object.create(null, {
            getBoardsInTrello: { get: () => super.getBoardsInTrello }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boards = yield _super.getBoardsInTrello.call(this);
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
    static handleWebhookUpdateCard(req, res) {
        const _super = Object.create(null, {
            webhookUpdate: { get: () => super.webhookUpdate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                taskQueue_1.updateTaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
                    let trelloData = req.body;
                    let task = yield _super.webhookUpdate.call(this, trelloData);
                    return res.status(200).send(task);
                }));
            }
            catch (error) {
                logger_1.default.error({ handleWebhookUpdateCardError: error });
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
                let members = yield _super.getSingleBoardInfo.call(this, id, type);
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
    static handleWebHookUpdateBoard(req, res) {
        const _super = Object.create(null, {
            webhookUpdateBoard: { get: () => super.webhookUpdateBoard }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = yield _super.webhookUpdateBoard.call(this, req.body);
                return res.send({ data });
            }
            catch (error) {
                logger_1.default.error({ handleCreateCardInBoardError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
};
exports.default = BoardReq;
