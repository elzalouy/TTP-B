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
const trelloApi_1 = require("./../services/trello/trelloApi");
const logger_1 = __importDefault(require("../../logger"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
var FormData = require("form-data");
(0, dotenv_1.config)();
class BoardController {
    static getBoardsInTrello() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__getTrelloBoards();
        });
    }
    static getSingleBoardInfo(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__singleBoardInfo(id, type);
        });
    }
    static getMembersInTrello() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__getAllMembers();
        });
    }
    static addMemberToBoard(boardId, memberId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__addMember(boardId, memberId, type);
        });
    }
    static addListToBoard(boardId, listName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__addList(boardId, listName);
        });
    }
    static removeMemberFromBoard(boardId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__removeMember(boardId, memberId);
        });
    }
    static addListToArchieve(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__archieveList(listId);
        });
    }
    static createWebHook(idModel) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__addWebHook(idModel);
        });
    }
    static deleteBoard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__deleteBoard(id);
        });
    }
    static deleteCard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__deleteCard(id);
        });
    }
    static createCardInList(listId, cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__createCard(listId, cardName);
        });
    }
    static createAttachmentOnCard(cardId, filePath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__createAttachment(cardId, filePath, fileName);
        });
    }
    static createNewBoard(name, color) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__createNewBoard(name, color);
        });
    }
    static updateBoard(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__updateBoard(id, values);
        });
    }
    static removeWebhook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__removeWebhook(id);
        });
    }
    static moveTaskToDiffList(cardId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__moveTaskToDiffList(cardId, listId);
        });
    }
    static __moveTaskToDiffList(cardId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let moveTask = (0, trelloApi_1.trelloApi)(`cards/${cardId}?idList=${listId}&`);
                return yield (0, node_fetch_1.default)(moveTask, {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((res) => logger_1.default.info("move board done", res))
                    .catch((err) => logger_1.default.info("error in moving board", err));
            }
            catch (error) {
                logger_1.default.error({ moveTaskToDiffListError: error });
            }
        });
    }
    static __deleteBoard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let removeBoard = (0, trelloApi_1.trelloApi)(`boards/${id}?response_type=token&`);
                logger_1.default.info({ removeBoard });
                return yield (0, node_fetch_1.default)(removeBoard, {
                    method: "DELETE",
                })
                    .then((response) => {
                    console.log(`Response: ${response.status} ${response.statusText}`);
                    return response.text();
                })
                    .then((text) => console.log(text))
                    .catch((err) => logger_1.default.info("error in delete board", err));
            }
            catch (error) {
                logger_1.default.error({ deleteBoardError: error });
            }
        });
    }
    static __removeWebhook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let webhookApi = (0, trelloApi_1.trelloApi)(`/webhooks/${id}&`);
                return yield (0, node_fetch_1.default)(webhookApi, {
                    method: "DELETE",
                });
            }
            catch (error) {
                logger_1.default.error({ removeWebhookError: error });
            }
        });
    }
    static __updateBoard(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, color } = values;
                let updateBoardApi = (0, trelloApi_1.trelloApi)(`boards/${id}/?name=${name}&prefs/background=${color}&`);
                let board = yield (0, node_fetch_1.default)(updateBoardApi, {
                    method: "PUT",
                });
                return board.json();
            }
            catch (error) {
                logger_1.default.error({ updateBoardError: error });
            }
        });
    }
    static __createNewBoard(name, color) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let createBoardApi = (0, trelloApi_1.trelloApi)(`boards/?name=${name}&prefs_background=${color}&defaultLists=false&`);
                let board = yield (0, node_fetch_1.default)(createBoardApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                let borderData = board.json();
                logger_1.default.info({ borderData, createBoardApi });
                return borderData;
            }
            catch (error) {
                logger_1.default.error({ createNewBoardError: error });
            }
        });
    }
    static __createAttachment(cardId, filePath, fileName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let bufferFile;
                console.log(filePath, fileName);
                yield fs_1.default.readFile(filePath, (error, data) => {
                    if (error)
                        throw error;
                    bufferFile = data;
                });
                if (bufferFile) {
                    let formData = new FormData();
                    formData.append("name", fileName);
                    formData.append("file", bufferFile === null || bufferFile === void 0 ? void 0 : bufferFile.toString("base64"));
                    let endpoint = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments`);
                    let response = yield (0, node_fetch_1.default)(endpoint, {
                        method: "POST",
                        headers: { Accept: "multipart/form-data" },
                        body: JSON.stringify(formData),
                    });
                    console.log(response.json());
                    if ([200, 201].includes(response.status) && response.body)
                        return response.json();
                }
                throw "File not existed";
            }
            catch (error) {
                logger_1.default.error({ createAttachmentOnCardError: error });
            }
        });
    }
    static __createCard(listId, cardName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let cardCreateApi = (0, trelloApi_1.trelloApi)(`cards?idList=${listId}&name=${cardName}&attachments=true&`);
                let cardResult = yield (0, node_fetch_1.default)(cardCreateApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                if (cardResult.status !== 200 && cardResult.status !== 201) {
                    console.log(cardResult);
                }
                return cardResult.json();
            }
            catch (error) {
                logger_1.default.error({ createCardInListError: error });
            }
        });
    }
    static __deleteCard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteCartApi = (0, trelloApi_1.trelloApi)(`cards/${id}?`);
                let deleteRessult = yield (0, node_fetch_1.default)(deleteCartApi, {
                    method: "DELETE",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return deleteRessult.json();
            }
            catch (error) {
                logger_1.default.error({ deleteTasksError: error });
            }
        });
    }
    static __addWebHook(idModel) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let webhookApi = (0, trelloApi_1.trelloApi)(`/webhooks/?callbackURL=${process.env.TRELLO_WEBHOOK_CALLBAKC_URL}&idModel=${idModel}&`);
                let webhookResult = yield (0, node_fetch_1.default)(webhookApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return webhookResult;
            }
            catch (error) {
                logger_1.default.error({ createWebHookError: error });
            }
        });
    }
    static __archieveList(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let archeiveApi = (0, trelloApi_1.trelloApi)(`lists/${listId}/closed?value=true&`);
                let archieve = yield (0, node_fetch_1.default)(archeiveApi, {
                    method: "PUT",
                });
                return archieve.json();
            }
            catch (error) {
                logger_1.default.error({ archieveListError: error });
            }
        });
    }
    static __removeMember(boardId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let removeApi = (0, trelloApi_1.trelloApi)(`boards/${boardId}/members/${memberId}?`);
                let remove = yield (0, node_fetch_1.default)(removeApi, {
                    method: "DELETE",
                });
                return remove.json();
            }
            catch (error) {
                logger_1.default.error({ removeMemberError: error });
            }
        });
    }
    static __addList(boardId, listName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let addListApi = (0, trelloApi_1.trelloApi)(`lists?name=${listName}&idBoard=${boardId}&`);
                let newList = yield (0, node_fetch_1.default)(addListApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return newList.json();
            }
            catch (error) {
                logger_1.default.error({ addListError: error });
            }
        });
    }
    static __addMember(boardId, memberId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let addMemberApi = (0, trelloApi_1.trelloApi)(`boards/${boardId}/members/${memberId}?type=${type}&`);
                let newMember = yield (0, node_fetch_1.default)(addMemberApi, {
                    method: "PUT",
                });
                // logger.info({boardId,memberId,type,addMemberApi,newMember})
                return newMember.json();
            }
            catch (error) {
                logger_1.default.error({ addMemberError: error });
            }
        });
    }
    static __getAllMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardApi = (0, trelloApi_1.trelloApi)(`organizations/${process.env.TEST_ORGANIZATION_ID}/members?`);
                let members = yield (0, node_fetch_1.default)(boardApi, {
                    method: "GET",
                });
                return members.json();
            }
            catch (error) {
                logger_1.default.error({ getTrelloMombersError: error });
            }
        });
    }
    static __getTrelloBoards() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardsApi = (0, trelloApi_1.trelloApi)(`organizations/${process.env.TEST_ORGANIZATION_ID}/boards?fields=id,name&`);
                let boards = yield (0, node_fetch_1.default)(boardsApi, {
                    method: "GET",
                });
                return boards.json();
            }
            catch (error) {
                logger_1.default.error({ getTrelloBoardError: error });
            }
        });
    }
    static __singleBoardInfo(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardApi = yield (0, trelloApi_1.trelloApi)(`boards/${id}/${type}?`);
                let board = yield (0, node_fetch_1.default)(boardApi, {
                    method: "GET",
                });
                return board.json();
            }
            catch (error) {
                logger_1.default.error({ singleBoardError: error });
            }
        });
    }
}
exports.default = BoardController;
