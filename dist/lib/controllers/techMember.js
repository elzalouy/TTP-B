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
const logger_1 = __importDefault(require("../../logger"));
const techMember_1 = __importDefault(require("../dbCalls/techMember/techMember"));
const errorUtils_1 = require("../utils/errorUtils");
const boards_1 = __importDefault(require("./boards"));
const TechMemberController = class TechMemberController extends techMember_1.default {
    static createNewMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberController.__createMember(data);
        });
    }
    static updateTechMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberController.__updateMember(data);
        });
    }
    static getTechMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TechMemberController.__getTechMmber(data);
        });
    }
    static __getTechMmber(data) {
        const _super = Object.create(null, {
            getTechMemberDB: { get: () => super.getTechMemberDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let techMember = yield _super.getTechMemberDB.call(this, data);
                return techMember;
            }
            catch (error) {
                logger_1.default.error({ getTechMemberError: error });
            }
        });
    }
    static __updateMember(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { boardId, trelloMemberId, listId, newBoardId, name } = data;
                let listIdValue = null;
                // I want to just remove member from board
                if (boardId === newBoardId) {
                    yield TechMemberController.__removeMemberAndList(listId, boardId, trelloMemberId);
                }
                // I want to move member from board to another
                if (newBoardId && newBoardId !== boardId) {
                    let checkExsit = yield TechMemberController.__checkBoardListName(newBoardId, name);
                    logger_1.default.info({ checkExsit });
                    if (checkExsit) {
                        return;
                    }
                    yield TechMemberController.__removeMemberAndList(listId, boardId, trelloMemberId);
                    yield boards_1.default.addMemberToBoard(newBoardId, trelloMemberId, "normal");
                    let list = yield boards_1.default.addListToBoard(newBoardId, name);
                    listIdValue = list.id;
                    data.boardId = newBoardId;
                }
                // I want to update user name
                if (!newBoardId) {
                    listIdValue = listId;
                }
                // Set list id to null
                data.listId = listIdValue;
                delete data.newBoardId;
                let updatedMember = yield techMember_1.default.updateTechMember(data);
                return updatedMember;
            }
            catch (error) {
                logger_1.default.error({ updateTechMemberError: error });
            }
        });
    }
    static __createMember(data) {
        const _super = Object.create(null, {
            createTechMember: { get: () => super.createTechMember }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { boardId, name, trelloMemberId } = data;
                let checkExsit = yield TechMemberController.__checkBoardListName(boardId, name);
                if (checkExsit) {
                    return (0, errorUtils_1.customeError)("list_already_exsit", 400);
                }
                // // add this member to board
                // BoardController.addMemberToBoard(boardId, trelloMemberId, "normal");
                let list = yield boards_1.default.addListToBoard(boardId, name);
                let techMember = yield _super.createTechMember.call(this, Object.assign(Object.assign({}, data), { listId: list.id }));
                return { techMember, status: 200 };
            }
            catch (error) {
                logger_1.default.error({ createMemberError: error });
            }
        });
    }
    static __removeMemberAndList(listId, boardId, trelloMemberId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Remove(archieve) the member list from board
                yield boards_1.default.addListToArchieve(listId);
                // Remove member from board
                yield boards_1.default.removeMemberFromBoard(boardId, trelloMemberId);
                return;
            }
            catch (error) {
                logger_1.default.error({ __removeMemberAndListError: error });
            }
        });
    }
    static __checkBoardListName(boardId, name) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let check = false;
                // Get Lists in Board
                let boardList = yield boards_1.default.getSingleBoardInfo(boardId, "lists");
                for (let i = 0; i < boardList.length; i++) {
                    if (name === boardList[i].name) {
                        check = true;
                    }
                }
                return check;
            }
            catch (error) {
                logger_1.default.error({ __checkBoardListNameError: error });
            }
        });
    }
};
exports.default = TechMemberController;
