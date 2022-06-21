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
const trelloApi_1 = require("../services/trelloApi");
const logger_1 = __importDefault(require("../../logger"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const config_1 = __importDefault(require("config"));
const dotenv_1 = require("dotenv");
const fs_1 = __importDefault(require("fs"));
const server_1 = require("../server");
const task_1 = __importDefault(require("./task"));
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
    static downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__downloadAttachment(cardId, attachmentId);
        });
    }
    static createAttachmentOnCard(cardId, file) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__createAttachment(cardId, file);
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
    static updateBoardCard(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__updateBoardCard(data);
        });
    }
    static webhookUpdate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield BoardController.__webhookUpdate(data);
        });
    }
    static __webhookUpdate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield BoardController.updateBoardCard(data);
            }
            catch (error) {
                logger_1.default.error({ webhookUpdateError: error });
            }
        });
    }
    static __moveTaskToDiffList(cardId, listId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let moveTask = (0, trelloApi_1.trelloApi)(`cards/${cardId}?idList=${listId}&`);
                yield (0, node_fetch_1.default)(moveTask, {
                    method: "PUT",
                    headers: {
                        Accept: "application/json",
                    },
                })
                    .then((res) => {
                    return res;
                })
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
                    .then((json) => {
                    return json;
                })
                    .catch((err) => {
                    throw err;
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
                    throw err;
                });
                return response;
            }
            catch (error) {
                logger_1.default.error({ deleteAttachmentFileError: error });
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
                let webhookApi = (0, trelloApi_1.trelloApi)(`/webhooks/?callbackURL=${config_1.default.get("Trello_Webhook_Callback_Url")}&idModel=${idModel}&`);
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
                let boardApi = (0, trelloApi_1.trelloApi)(`boards/${id}/${type}?`);
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
    static __downloadAttachment(cardId, attachmentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let api = (0, trelloApi_1.trelloApi)(`cards/${cardId}/attachments/${attachmentId}?fields=url&`);
                let Response = null;
                yield (0, node_fetch_1.default)(api, {
                    method: "GET",
                    headers: {
                        Accept: "application/json",
                    },
                }).then((response) => __awaiter(this, void 0, void 0, function* () {
                    Response = JSON.parse(yield response.text());
                }));
                return Response;
            }
            catch (error) {
                logger_1.default.error({ downloadAttachment: error });
            }
        });
    }
    static __updateCard(cardId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let params = {
                    method: "PUT",
                    headers: {
                        Accept: "*/*",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ name: data.name, desc: data.desc }),
                };
                let api = (0, trelloApi_1.trelloApi)(`cards/${cardId}?`);
                let response = yield (0, node_fetch_1.default)(api, params)
                    .then((res) => __awaiter(this, void 0, void 0, function* () {
                    let result = yield res.json();
                    console.log("update card result", result);
                    return result;
                }))
                    .catch((err) => {
                    throw err;
                });
                return response;
            }
            catch (error) {
                logger_1.default.error({ __updateCardError: error });
            }
        });
    }
    /**
     * updateBoardCard
     *
     * Update task with a new data coming from trello,
     * here is the actions handled here :-
     * - add Attachment
     * - change name
     * - description
     * - move task from list to list
     *
     * @param data webhook request data inserted with the webhook call.
     */
    static __updateBoardCard(data) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log(data.action.data);
                let type = (_a = data.action) === null || _a === void 0 ? void 0 : _a.type;
                let action = data.action.display.translationKey;
                let task = {
                    name: data.action.data.card.name,
                    listId: data.action.data.card.idList,
                    status: (_c = (_b = data.action.data) === null || _b === void 0 ? void 0 : _b.list) === null || _c === void 0 ? void 0 : _c.name,
                    boardId: data.action.data.board.id,
                    cardId: (_d = data.action.data.card) === null || _d === void 0 ? void 0 : _d.id,
                };
                // create
                // if (type === "createCard") {
                //   task.listId = data.action.data.list.id;
                //   task.status = data.action.data.list.name;
                //   let result = await TaskController.createTaskByTrello(task);
                //   io.sockets.emit("create task", result);
                // }
                //update
                if (type === "updateCard" && action !== "action_archived_card") {
                    if (action === "action_changed_description_of_card")
                        task.description = (_e = data.action.data.card) === null || _e === void 0 ? void 0 : _e.desc;
                    if (action === "action_renamed_card")
                        task.description = data.action.data.card.name;
                    if (action === "action_move_card_from_list_to_list") {
                        task.status = (_f = data.action.data.listAfter) === null || _f === void 0 ? void 0 : _f.name;
                        task.listId = (_g = data.action.data.listAfter) === null || _g === void 0 ? void 0 : _g.id;
                        task.lastMove = data.action.data.listBefore.name;
                        task.lastMoveDate = new Date().toUTCString();
                    }
                    let result = yield task_1.default.updateTaskByTrelloDB(task);
                    server_1.io.sockets.emit("update task", result);
                }
                // add attachment
                if (type === "addAttachmentToCard") {
                    task.attachedFiles = [
                        {
                            trelloId: (_j = (_h = data.action.data) === null || _h === void 0 ? void 0 : _h.attachment) === null || _j === void 0 ? void 0 : _j.id,
                            name: (_l = (_k = data.action.data) === null || _k === void 0 ? void 0 : _k.attachment) === null || _l === void 0 ? void 0 : _l.name,
                            url: (_m = data.action.data.attachment) === null || _m === void 0 ? void 0 : _m.url,
                            // utils function to detect type from name.ext
                            mimeType: "",
                        },
                    ];
                    let result = yield task_1.default.updateTaskByTrelloDB(task);
                    server_1.io.sockets.emit("update task", result);
                }
                // archive, unArchive or delete
                if (type === "updateCard" && action === "action_archived_card") {
                    let result = yield task_1.default.archiveTaskByTrelloDB(task, true);
                    return server_1.io.sockets.emit("update task", result);
                }
                if (type === "updateCard" && action === "action_sent_card_to_board") {
                    task.status = data.action.data.list.name;
                    task.listId = data.action.data.list.id;
                    let result = yield task_1.default.archiveTaskByTrelloDB(task, false);
                    return server_1.io.sockets.emit("update task", result);
                }
                //delete
                if (type === "deleteCard") {
                    let result = yield task_1.default.deleteTaskByTrelloDB(task);
                    server_1.io.sockets.emit("delete task", result);
                }
            }
            catch (error) {
                logger_1.default.error({ updateBoardCardError: error });
            }
        });
    }
}
exports.default = BoardController;
