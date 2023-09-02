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
const Department_1 = require("../types/model/Department");
const lodash_1 = __importDefault(require("lodash"));
const TrelloSnapshots_1 = __importDefault(require("../models/TrelloSnapshots"));
const mongodb_1 = require("mongodb");
(0, dotenv_1.config)();
var FormData = require("form-data");
class TrelloController {
    static getBoardsInTrello(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__getTrelloBoards(filter);
        });
    }
    static getSingleBoardInfo(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__singleBoardInfo(id);
        });
    }
    static getMembersInTrello() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__getAllMembers();
        });
    }
    static addMemberToBoard(boardId, memberId, type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__addMember(boardId, memberId, type);
        });
    }
    static addListToBoard(boardId, listName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__addList(boardId, listName);
        });
    }
    static removeMemberFromBoard(boardId, memberId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__removeMember(boardId, memberId);
        });
    }
    static addListToArchieve(listId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__archieveList(listId);
        });
    }
    static createWebHook(idModel, urlInConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__addWebHook(idModel, urlInConfig);
        });
    }
    static deleteBoard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__deleteBoard(id);
        });
    }
    static deleteCard(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__deleteCard(id);
        });
    }
    static createCardInList(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__createCard(data);
        });
    }
    static downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__downloadAttachment(cardId, attachmentId);
        });
    }
    static createAttachmentOnCard(cardId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__createAttachment(cardId, file);
        });
    }
    static createNewBoard(name, color) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__createNewBoard(name, color);
        });
    }
    static updateBoard(id, values) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__updateBoard(id, values);
        });
    }
    static removeWebhook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__removeWebhook(id);
        });
    }
    static moveTaskToDiffList(cardId, listId, due) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TrelloController.__moveTaskToDiffList(cardId, listId, due !== null && due !== void 0 ? due : undefined);
        });
    }
    static getBoardsActions(boardId, format, limit, page) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = `boards/${boardId}/actions/?format=${format}&`;
                let apiUrl = (0, trelloApi_1.trelloApi)(url);
                let result;
                yield (0, node_fetch_1.default)(apiUrl, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }).then((res) => __awaiter(this, void 0, void 0, function* () {
                    result = yield res.json();
                }));
                return result;
            }
            catch (error) {
                logger_1.default.error({ getBoardsActionsError: error });
            }
        });
    }
    static __moveTaskToDiffList(cardId, listId, due) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = `cards/${cardId}/?idList=${listId}&`;
                if (due)
                    url = `${url}due=${new Date(due).getTime()}&`;
                let moveTask = (0, trelloApi_1.trelloApi)(url);
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
                    .catch((err) => logger_1.default.warning("error in moving board", err));
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
                logger_1.default.warning({ removeBoard });
                return yield (0, node_fetch_1.default)(removeBoard, {
                    method: "DELETE",
                })
                    .then((response) => {
                    return response.text();
                })
                    .catch((err) => logger_1.default.warning("error in delete board", err));
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
                let url = `cards/?idList=${(_a = data.teamListId) !== null && _a !== void 0 ? _a : data.listId}&name=${decodeURIComponent(data.name)}&desc=${decodeURIComponent(data.description)}&`;
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
                let url = (0, trelloApi_1.trelloApi)(`boards/${boardId}/cards/all?`);
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
                let url = yield (0, trelloApi_1.trelloApi)(`boards/${boardId}/lists?filter=all&`);
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
    static _getCreationActionOfCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = yield (0, trelloApi_1.trelloApi)(`cards/${cardId}/actions/?filter=createCard&`);
                let actions = yield (0, node_fetch_1.default)(url, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });
                return yield actions.json();
            }
            catch (error) {
                logger_1.default.error({ error });
            }
        });
    }
    static _getCardMovementsActions(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let page = 0;
                let actions = [];
                for (page; page <= 19; page++) {
                    let url = yield (0, trelloApi_1.trelloApi)(`cards/${cardId}/actions/?filter=updateCard:idList&page=${page}&`);
                    let newActions = yield (0, node_fetch_1.default)(url, {
                        method: "GET",
                        headers: { Accept: "application/json" },
                    }).then((res) => __awaiter(this, void 0, void 0, function* () {
                        return yield res.json();
                    }));
                    if (newActions && newActions.length > 0)
                        actions = [...actions, ...newActions];
                    if (newActions.length < 50)
                        break;
                }
                return actions;
            }
            catch (error) {
                logger_1.default.error({ _getCardMovementsActionsError: error });
            }
        });
    }
    static _getCardDeadlineActions(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = yield (0, trelloApi_1.trelloApi)(`cards/${cardId}/actions/?filter=updateCard:idList&`);
                let actions = yield (0, node_fetch_1.default)(url, {
                    method: "GET",
                    headers: { Accept: "application/json" },
                });
                return yield actions.json();
            }
            catch (error) {
                logger_1.default.error({ _getCardMovementsActionsError: error });
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
    static __getCard(cardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let url = (0, trelloApi_1.trelloApi)(`cards/${cardId}?`);
                let card = yield (0, node_fetch_1.default)(url, { method: "GET" });
                if (card.ok === true)
                    return yield card.json();
                else
                    return null;
            }
            catch (error) {
                logger_1.default.error({ getCardError: error });
            }
        });
    }
    static __getTrelloBoards(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boardsApi = (0, trelloApi_1.trelloApi)(`organizations/${config_1.default.get("trelloOrgId")}/boards/?filter=${filter}&fields=id,name,closed&`);
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
    static addCommentToCard(id, text) {
        return __awaiter(this, void 0, void 0, function* () {
            let trelloApi = `cards/${id}/actions/comments?text=${text}&`;
            let result = yield (0, node_fetch_1.default)(trelloApi, {
                method: "POST",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
            });
            if (result.ok)
                return yield result.json();
            else
                return null;
        });
    }
    static uodateCommentToCard(id, text, idAction) {
        return __awaiter(this, void 0, void 0, function* () {
            let trelloApi = `cards/${id}/actions/${idAction}/comments?text=${text}&`;
            let result = yield (0, node_fetch_1.default)(trelloApi, {
                method: "PUT",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
            });
            if (result.ok)
                return yield result.json();
            else
                return null;
        });
    }
    static deleteCommentToCard(id, text, idAction) {
        return __awaiter(this, void 0, void 0, function* () {
            let trelloApi = `cards/${id}/actions/${idAction}/comments?`;
            let result = yield (0, node_fetch_1.default)(trelloApi, {
                method: "DELETE",
                headers: {
                    Accept: "*/*",
                    "Content-Type": "application/json",
                },
            });
            if (result.ok)
                return yield result.json();
            else
                return null;
        });
    }
    static __updateCard({ cardId, data }) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let body = {
                    name: decodeURIComponent(data.name),
                    desc: decodeURIComponent(data.desc),
                    due: data.due,
                    start: data.start,
                    idList: data.idList,
                    idBoard: data.idBoard,
                    closed: false,
                };
                if ((data === null || data === void 0 ? void 0 : data.closed) === true)
                    body.closed = true;
                else
                    body.closed = false;
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
    static __postSnapshotOfActions() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boards = yield TrelloController.getBoardsInTrello("open");
                let pages = [];
                let actionsByBoards = yield Promise.all(boards.map((i) => __awaiter(this, void 0, void 0, function* () {
                    let count = yield TrelloController.getBoardsActions(i.id, "count").then((res) => res._value);
                    pages = new Array(Math.ceil(count / 1000)).fill(0);
                    let actions = lodash_1.default.flattenDeep(yield Promise.all(pages.map((page, index) => __awaiter(this, void 0, void 0, function* () {
                        return yield TrelloController.getBoardsActions(i.id, "list", 1000, index + 1);
                    }))));
                    return { total: count, actions };
                })));
                let snapShot = new TrelloSnapshots_1.default({
                    actions: lodash_1.default.flattenDeep(actionsByBoards.map((actions) => actions.actions)),
                    createdAt: new Date(Date.now()),
                });
                yield snapShot.save();
                return actionsByBoards;
            }
            catch (error) {
                logger_1.default.error({ __postSnapshotOfActionsError: error });
            }
        });
    }
    static restoreTrelloCards(id) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let boards = yield TrelloController.getBoardsInTrello("open");
                boards = yield Promise.all(boards === null || boards === void 0 ? void 0 : boards.map((item) => __awaiter(this, void 0, void 0, function* () {
                    let lists = yield TrelloController.__getBoardLists(item.id);
                    item.lists = lists;
                    return item;
                })));
                let activities = yield TrelloSnapshots_1.default.findOne({
                    _id: new mongodb_1.ObjectId(id),
                });
                let actions = (_a = activities === null || activities === void 0 ? void 0 : activities.actions) === null || _a === void 0 ? void 0 : _a.filter((i) => ["createCard", "updateCard", "deleteCard"].includes(i.type));
                TrelloController.__restoreTaskActions(actions, boards);
                return { activities };
            }
            catch (error) {
                logger_1.default.error({ error });
            }
        });
    }
    static __restoreTaskActions(actions, boards) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let creativeBoard = boards.find((board) => board.name === config_1.default.get("CreativeBoard"));
                let deletedCards = actions === null || actions === void 0 ? void 0 : actions.filter((i) => i.type === "deleteCard");
                let newCards = yield Promise.all(deletedCards.map((cardAction) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e;
                    let cardActions = actions.filter((action) => action.data.card.id === cardAction.data.card.id);
                    let board = (_a = boards.find((board) => board.id === cardAction.data.board.id)) !== null && _a !== void 0 ? _a : creativeBoard;
                    let list = (_b = board.lists.find((i) => i.name === cardAction.data.list.name)) !== null && _b !== void 0 ? _b : creativeBoard.lists.find((list) => list.name === "Tasks Board");
                    let card = yield TrelloController.__createCard({
                        name: (_e = (_d = (_c = cardAction.data) === null || _c === void 0 ? void 0 : _c.card) === null || _d === void 0 ? void 0 : _d.name) !== null && _e !== void 0 ? _e : "",
                        listId: list === null || list === void 0 ? void 0 : list.id,
                        boardId: board === null || board === void 0 ? void 0 : board.id,
                    });
                    yield TrelloController.__addWebHook(card.id, "trelloWebhookUrlTask");
                    yield cardActions.map((action) => __awaiter(this, void 0, void 0, function* () {
                        var _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
                        if (action.type === "updateCard")
                            yield TrelloController.__updateCard({
                                cardId: card.id,
                                data: {
                                    name: action.data.card.name,
                                    idList: Department_1.ListTypes.includes(action.data.list.name)
                                        ? board.lists.find((list) => list.name === action.data.list.name).id
                                        : list.id,
                                    idBoard: board.id,
                                    desc: (_j = (_h = (_g = (_f = action.data) === null || _f === void 0 ? void 0 : _f.card) === null || _g === void 0 ? void 0 : _g.desc) !== null && _h !== void 0 ? _h : card === null || card === void 0 ? void 0 : card.desc) !== null && _j !== void 0 ? _j : undefined,
                                    due: (_o = (_m = (_l = (_k = action.data) === null || _k === void 0 ? void 0 : _k.card) === null || _l === void 0 ? void 0 : _l.due) !== null && _m !== void 0 ? _m : card === null || card === void 0 ? void 0 : card.due) !== null && _o !== void 0 ? _o : undefined,
                                    start: (_s = (_r = (_q = (_p = action.data) === null || _p === void 0 ? void 0 : _p.card) === null || _q === void 0 ? void 0 : _q.start) !== null && _r !== void 0 ? _r : card === null || card === void 0 ? void 0 : card.start) !== null && _s !== void 0 ? _s : undefined,
                                },
                            });
                        else if (action.type === "commentCard")
                            yield TrelloController.addCommentToCard(card.id, action.data.text);
                    }));
                    return card;
                })));
            }
            catch (error) {
                logger_1.default.error({ restoreTaskActionsError: error });
            }
        });
    }
    static deleteOldSnapshots() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let snapshots = yield TrelloSnapshots_1.default.find({}).sort({ createdAt: 1 });
                // if(snapshots.length>15)
            }
            catch (error) {
                logger_1.default.error({ error });
            }
        });
    }
    static getActionsOfCard(cardId, departments, due) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let currentTeam;
                let createAction = yield TrelloController._getCreationActionOfCard(cardId);
                let actions = yield TrelloController._getCardMovementsActions(cardId);
                actions = lodash_1.default.sortBy(actions, "date");
                let dueChanges = yield TrelloController._getCardDeadlineActions(cardId);
                dueChanges =
                    dueChanges.length > 0
                        ? dueChanges.map((i) => {
                            return Object.assign(Object.assign({}, i), { date: new Date(i.date).getTime() });
                        })
                        : [];
                dueChanges =
                    dueChanges.length > 0 ? lodash_1.default.orderBy(dueChanges, "date", "desc") : [];
                let dueDates = dueChanges.length > 0
                    ? dueChanges.map((i) => new Date(i.data.card.due).getTime())
                    : [];
                dueDates = dueDates.sort((a, b) => b - a);
                let cardsActions = [
                    new CardAction(createAction[0], ((_a = dueDates[0]) !== null && _a !== void 0 ? _a : due) ? new Date(due).toDateString() : null),
                    ...actions.map((action, index) => {
                        var _a;
                        return new CardAction(action, ((_a = dueDates[index]) !== null && _a !== void 0 ? _a : due) ? new Date(due).toDateString() : null);
                    }),
                ];
                cardsActions = cardsActions.map((cardAction) => cardAction.validate(departments));
                /// First create status
                cardsActions = cardsActions.filter((i) => { var _a; return ((_a = i === null || i === void 0 ? void 0 : i.action) === null || _a === void 0 ? void 0 : _a.deleteAction) === false; });
                let movements = cardsActions.map((cardAction) => {
                    return {
                        movedAt: new Date(cardAction.action.date).toDateString(),
                        listId: cardAction.action.listId,
                        status: cardAction.action.status,
                        isTeam: cardAction.action.listType === "team",
                        journeyDeadline: cardAction.action.dueChange,
                    };
                });
                return { movements, currentTeam };
            }
            catch (error) {
                logger_1.default.error({ error });
            }
        });
    }
}
class CardAction {
    constructor(action, dueDate) {
        this.validate = (deps) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            let board = deps.find((i) => i.boardId === this.action.data.board.id);
            let date = this.action.date;
            let listId = (_c = (_b = (_a = this.action.data) === null || _a === void 0 ? void 0 : _a.list) === null || _b === void 0 ? void 0 : _b.id) !== null && _c !== void 0 ? _c : (_e = (_d = this.action.data) === null || _d === void 0 ? void 0 : _d.listAfter) === null || _e === void 0 ? void 0 : _e.id;
            this.action.listId = listId;
            let listName = (_h = (_g = (_f = this.action.data) === null || _f === void 0 ? void 0 : _f.list) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : (_k = (_j = this.action.data) === null || _j === void 0 ? void 0 : _j.listAfter) === null || _k === void 0 ? void 0 : _k.name;
            if (!board || !date) {
                this.action.deleteAction = true;
                return this;
            }
            let list = (_l = board === null || board === void 0 ? void 0 : board.lists) === null || _l === void 0 ? void 0 : _l.find((l) => l.listId === listId);
            if (list) {
                this.action.listType = "list";
                this.action.status = list.name;
                console.log({
                    type: "existed_in_current_list_status",
                    name: this.action.data.card.name,
                    list: listName,
                });
            }
            else {
                list = (_m = board === null || board === void 0 ? void 0 : board.teams) === null || _m === void 0 ? void 0 : _m.find((t) => t.listId === listId);
                if (list) {
                    console.log({
                        type: "existed_in_current_list_team",
                        name: this.action.data.card.name,
                        list: listName,
                    });
                    this.action.listType = "team";
                    this.action.status = "In Progress";
                }
                else {
                    list = board.sideLists.find((i) => i.listId === listId);
                    if (list) {
                        console.log({
                            type: "existed_in_current_list_sideList",
                            name: this.action.data.card.name,
                            list: listName,
                        });
                        this.action.listType = "sidelist";
                        this.action.status = "Tasks Board";
                    }
                    else {
                        list = board.lists.find((l) => l.name === listName);
                        if (list) {
                            console.log({
                                type: "existed_in_archived_list_status",
                                name: this.action.data.card.name,
                                list: listName,
                            });
                            this.action.data.list.id = list.listId;
                            this.action.status = list.name;
                            this.action.listType = "list";
                        }
                        else
                            this.action.deleteAction = this.action && true;
                    }
                }
            }
            if (["Shared", "Done", "Cancled"].includes(this.action.status) &&
                this.dueDate) {
                this.action.dueChange = new Date(this.dueDate).toDateString();
            }
            return this;
        };
        this.action = action;
        this.action.deleteAction = false;
        this.dueDate = dueDate;
    }
}
exports.default = TrelloController;
