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
const fs_1 = __importDefault(require("fs"));
const config_1 = __importDefault(require("config"));
const logger_1 = __importDefault(require("../../logger"));
const dotenv_1 = require("dotenv");
const trelloApi_1 = require("../services/trelloApi");
const node_fetch_1 = __importDefault(require("node-fetch"));
(0, dotenv_1.config)();
var FormData = require("form-data");
class TrelloActionsController {
    static getBoardsInTrello() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__getTrelloBoards();
        });
    }
    static getSingleBoardInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__singleBoardInfo(id);
        });
    }
    static getMembersInTrello() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__getAllMembers();
        });
    }
    static addMemberToBoard(boardId, memberId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__addMember(boardId, memberId, type);
        });
    }
    static addListToBoard(boardId, listName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__addList(boardId, listName);
        });
    }
    static removeMemberFromBoard(boardId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__removeMember(boardId, memberId);
        });
    }
    static addListToArchieve(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__archieveList(listId);
        });
    }
    static createWebHook(idModel, urlInConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__addWebHook(idModel, urlInConfig);
        });
    }
    static deleteBoard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__deleteBoard(id);
        });
    }
    static deleteCard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__deleteCard(id);
        });
    }
    static createCardInList(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__createCard(data);
        });
    }
    static downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__downloadAttachment(cardId, attachmentId);
        });
    }
    static createAttachmentOnCard(cardId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__createAttachment(cardId, file);
        });
    }
    static createNewBoard(name, color) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__createNewBoard(name, color);
        });
    }
    static updateBoard(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__updateBoard(id, values);
        });
    }
    static removeWebhook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__removeWebhook(id);
        });
    }
    static moveTaskToDiffList(cardId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloActionsController.__moveTaskToDiffList(cardId, listId);
        });
    }
    static __moveTaskToDiffList(cardId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let moveTask = (0, trelloApi_1.trelloApi)(`cards/${cardId}/?idList=${listId}&`);
                let result = yield (0, node_fetch_1.default)(moveTask, {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    return res.json();
                }))
                    .then((value) => {
                    return value;
                })
                    .catch((err) => logger_1.default.info("error in moving board", err));
                return result;
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
                    return response.text();
                })
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
                }).catch((err) => {
                    logger_1.default.error({ err });
                    return {
                        error: "TrelloError",
                        message: "Failed to update trello name and color",
                    };
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
                let createBoardApi = (0, trelloApi_1.trelloApi)(`boards/?name=${name}&prefs_background=${color}&defaultLists=false&idOrganization=${config_1.default.get("trelloOrgId")}&`);
                let board = yield (0, node_fetch_1.default)(createBoardApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return yield board.json();
            }
            catch (error) {
                logger_1.default.error({ createNewBoardError: error });
            }
        });
    }
    static __createAttachment(cardId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let formData = new FormData();
                formData.append("id", cardId);
                formData.append("name", file.filename);
                formData.append("mimeType", file.mimetype);
                formData.append("file", fs_1.default.readFileSync(file.path), {
                    contentType: file.mimetype,
                    name: "file",
                    filename: file.filename,
                });
                let endpoint = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments?`);
                let Response;
                yield (0, node_fetch_1.default)(endpoint, {
                    method: "POST",
                    body: formData,
                })
                    .then((response) => __awaiter(this, void 0, void 0, function* () {
                    Response = JSON.parse(yield response.text());
                }))
                    .catch((err) => {
                    logger_1.default.error(err);
                });
                return Response;
            }
            catch (error) {
                logger_1.default.error({ createAttachmentOnCardError: error });
            }
        });
    }
    static __deleteAtachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let endpoint = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments/${attachmentId}?`);
                let response;
                yield (0, node_fetch_1.default)(endpoint, { method: "DELETE" })
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    response = yield res.json();
                }))
                    .catch((err) => {
                    logger_1.default.error({ err });
                    return err;
                });
                return response;
            }
            catch (error) {
                logger_1.default.error({ deleteAttachmentFileError: error });
            }
        });
    }
    static __createProject(listId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let response;
                let url = `cards/?idList=${listId}&name=${data.name}&`;
                if (data.projectDeadline)
                    url = `${url}due=${new Date(data.projectDeadline).getTime()}&`;
                if (data.startDate)
                    url = `${url}start=${new Date(data.startDate).getTime()}`;
                url = `${url}&attachments=true&`;
                let cardCreateApi = (0, trelloApi_1.trelloApi)(url);
                let cardResult = yield (0, node_fetch_1.default)(cardCreateApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                }).then((res) => {
                    response = res;
                    return res;
                });
                return yield response.json();
            }
            catch (error) {
                logger_1.default.error({ createProjectCardError: error });
            }
        });
    }
    static __createCard(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = `cards/?idList=${(_a = data.teamListId) !== null && _a !== void 0 ? _a : data.listId}&name=${data.name}&desc=${data.description}&`;
                if (data.start)
                    url = `${url}start=${new Date(data.start).getTime()}&`;
                if (data.deadline)
                    url = `${url}due=${new Date(data.deadline).getTime()}&`;
                let cardCreateApi = (0, trelloApi_1.trelloApi)(url);
                let cardResult = yield (0, node_fetch_1.default)(cardCreateApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return yield cardResult.json();
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
                return yield deleteRessult.json();
            }
            catch (error) {
                logger_1.default.error({ deleteTasksError: error });
            }
        });
    }
    static __getCardsInBoard(boardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = (0, trelloApi_1.trelloApi)(`boards/${boardId}/cards?`);
                let result = yield (0, node_fetch_1.default)(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return yield result.json();
            }
            catch (error) {
                logger_1.default.error({ getCardsInBoardError: error });
            }
        });
    }
    static __getCardAttachments(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let api = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments?`);
                let Response;
                yield (0, node_fetch_1.default)(api).then((data) => __awaiter(this, void 0, void 0, function* () {
                    Response = JSON.parse(yield data.text());
                }));
                return Response;
            }
            catch (error) {
                logger_1.default.error({ getAttachmentsError: error });
            }
        });
    }
    static __addWebHook(idModel, urlInConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let route = "webhooks";
                let params = `idModel=${idModel}&callbackURL=${config_1.default.get(urlInConfig)}`;
                let webhookApi = (0, trelloApi_1.trelloApiWithUrl)(route, params);
                (0, node_fetch_1.default)(webhookApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    return res.text();
                }))
                    .catch((err) => console.log({ err }));
            }
            catch (error) {
                logger_1.default.error({ createWebHookError: error });
            }
        });
    }
    static __getAllWebWebHook(idModel, urlInConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let webhookUrl = `webhooks/?idModel=${idModel}&callbackURL=${config_1.default.get(urlInConfig)}&`;
                let webhookApi = (0, trelloApi_1.trelloApi)(webhookUrl);
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
    static __getBoardLists(boardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = yield (0, trelloApi_1.trelloApi)(`boards/${boardId}/lists?`);
                let lists = yield (0, node_fetch_1.default)(url, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                });
                return yield lists.json();
            }
            catch (error) {
                logger_1.default.error({ getBoardListsError: error });
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
                return yield archieve.json();
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
                return yield remove.json();
            }
            catch (error) {
                logger_1.default.error({ removeMemberError: error });
            }
        });
    }
    static __addList(boardId, listName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result;
                let addListApi = (0, trelloApi_1.trelloApi)(`lists?name=${listName}&idBoard=${boardId}&`);
                yield (0, node_fetch_1.default)(addListApi, {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    result = yield res.json();
                }))
                    .catch((err) => {
                    logger_1.default.error({ err });
                    return err;
                });
                return result;
            }
            catch (error) {
                logger_1.default.error({ addListError: error });
                return error;
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
                return yield newMember.json();
            }
            catch (error) {
                logger_1.default.error({ addMemberError: error });
            }
        });
    }
    static __getAllMembers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardApi = (0, trelloApi_1.trelloApi)(`organizations/${config_1.default.get("trelloOrgId")}/memberships?member=true&`);
                let members = yield (0, node_fetch_1.default)(boardApi, {
                    method: "GET",
                });
                return yield members.json();
            }
            catch (error) {
                logger_1.default.error({ getTrelloMombersError: error });
            }
        });
    }
    static __getTrelloBoards() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardsApi = (0, trelloApi_1.trelloApi)(`organizations/${config_1.default.get("trelloOrgId")}/boards?fields=id,name&`);
                let boards = yield (0, node_fetch_1.default)(boardsApi, {
                    method: "GET",
                });
                return yield boards.json();
            }
            catch (error) {
                logger_1.default.error({ getTrelloBoardError: error });
            }
        });
    }
    static __singleBoardInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardApi = (0, trelloApi_1.trelloApi)(`boards/${id}?`);
                let board = yield (0, node_fetch_1.default)(boardApi, {
                    method: "GET",
                });
                return yield board.json();
            }
            catch (error) {
                logger_1.default.error({ singleBoardError: error });
            }
        });
    }
    static __moveAllCardsInList(id, idBoard, idList) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardApi = (0, trelloApi_1.trelloApi)(`lists/${id}/moveAllCards?idBoard=${idBoard}&idList=${idList}&`);
                let result = yield (0, node_fetch_1.default)(boardApi, {
                    method: "POST",
                });
                return yield result.json();
            }
            catch (error) {
                logger_1.default.error({ moveAllCardsInListsError: error });
            }
        });
    }
    static __downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let api = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments/${attachmentId}?fields=url&`);
                let Response = null;
                yield (0, node_fetch_1.default)(api, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                        Authorization: `OAuth oauth_consumer_key=${config_1.default.get("trelloKey")}, oauth_token=${config_1.default.get("trelloToken")}`,
                    },
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    Response = yield response.json();
                }));
                return Response;
            }
            catch (error) {
                logger_1.default.error({ downloadAttachment: error });
            }
        });
    }
    static __updateCard({ cardId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = {
                    name: data.name,
                    desc: data.desc,
                    due: data.due,
                    start: data.start,
                    idList: data.idList,
                    idBoard: data.idBoard,
                };
                logger_1.default.info({ body });
                let params = {
                    method: "PUT",
                    headers: {
                        Accept: "*/*",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                };
                let api = (0, trelloApi_1.trelloApi)(`cards/${cardId}?`);
                let response;
                yield (0, node_fetch_1.default)(api, params)
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    response = yield res.json();
                }))
                    .catch((err) => {
                    logger_1.default.error({ err });
                    return err;
                });
                return response;
            }
            catch (error) {
                logger_1.default.error({ __updateCardError: error });
            }
        });
    }
}
exports.default = TrelloActionsController;
