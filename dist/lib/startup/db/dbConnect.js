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
exports.createTTPCreativeMainBoard = exports.initializeTTPTasks = exports.initializeTrelloBoards = exports.initializeTrelloMembers = void 0;
const auth_1 = require("../../services/auth");
const mongoose_1 = require("mongoose");
const dotenv_1 = require("dotenv");
const logger_1 = __importDefault(require("../../../logger"));
const user_1 = __importDefault(require("../../dbCalls/user/user"));
const config_1 = __importDefault(require("config"));
const Department_1 = __importDefault(require("../../models/Department"));
const department_1 = __importDefault(require("../../controllers/department"));
const trello_1 = __importDefault(require("../../controllers/trello"));
const Department_2 = require("../../types/model/Department");
const lodash_1 = __importDefault(require("lodash"));
const Task_1 = __importDefault(require("../../models/Task"));
const task_1 = __importDefault(require("../../controllers/task"));
(0, dotenv_1.config)();
const db = config_1.default.get("mongoDbConnectionString");
logger_1.default.info({ db });
const mongoDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: process.env.NODE_ENV === "production" ? false : true,
            autoCreate: process.env.NODE_ENV === "production" ? false : true,
            //By default, mongoose buffers commands when the connection goes down until the driver manages to reconnect. To disable buffering, set bufferCommands to false.
            bufferCommands: true,
            // how much time mongo can wait until berfore throwing an error
            connectTimeoutMS: 5000,
        };
        yield (0, mongoose_1.connect)(db, options);
        console.log("Mongo DB connected,", config_1.default.get("mongoDbConnectionString"));
        initializeAdminUser();
    }
    catch (error) {
        console.error({ mongoDBError: error });
        process.exit(1);
    }
});
const initializeAdminUser = () => __awaiter(void 0, void 0, void 0, function* () {
    // adding superAdmin in db if not exists
    const userInfo = yield user_1.default.findUser({
        email: new RegExp(config_1.default.get("superAdminEmail"), "i"),
    });
    if (!userInfo) {
        let passwordHash = yield (0, auth_1.hashBassword)(config_1.default.get("superAdminPassword"));
        const data = {
            name: "abdulaziz qannam",
            email: config_1.default.get("superAdminEmail"),
            password: passwordHash,
            role: "SM",
            verified: true,
        };
        yield user_1.default.createUser(data);
    }
});
const initializeTrelloMembers = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // let members = await TrelloController.__getAllMembers();
    }
    catch (error) {
        logger_1.default.error(error);
    }
});
exports.initializeTrelloMembers = initializeTrelloMembers;
const initializeTrelloBoards = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let allBoards, allDepartments, listTypes, listExisted, boardsIds, depsIds, notExistedOnTTP, notExistedOnTrello, intersection;
        let newDeps = [];
        allBoards = yield trello_1.default.getBoardsInTrello("open");
        boardsIds = allBoards === null || allBoards === void 0 ? void 0 : allBoards.map((item) => item.id);
        allDepartments = yield Department_1.default.find({});
        depsIds = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => item.boardId);
        intersection = allDepartments.filter((item) => boardsIds === null || boardsIds === void 0 ? void 0 : boardsIds.includes(item.boardId));
        // Not Existed on Trello > create it on trello
        notExistedOnTrello = allDepartments.filter((item) => !boardsIds.includes(item.boardId));
        notExistedOnTrello = yield Promise.all(yield notExistedOnTrello.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            let board = yield trello_1.default.createNewBoard(item.name, item.color);
            item.boardId = board.id;
            listTypes = Department_2.ListTypes;
            yield Promise.all(listTypes === null || listTypes === void 0 ? void 0 : listTypes.map((list) => __awaiter(void 0, void 0, void 0, function* () {
                let listInBoard = yield trello_1.default.addListToBoard(board.id, list);
                let listInDepIndex = item.lists.findIndex((i) => i.name === list);
                item.lists[listInDepIndex].listId = listInBoard.id;
            })));
            yield Promise.all((_a = item.teams
                .filter((t) => t.isDeleted === false)) === null || _a === void 0 ? void 0 : _a.map((team, index) => __awaiter(void 0, void 0, void 0, function* () {
                let teamInBoard = yield trello_1.default.addListToBoard(board.id, team.name);
                item.teams[index].listId = teamInBoard.id;
            })));
            yield Promise.all(item.sideLists.map((list, index) => __awaiter(void 0, void 0, void 0, function* () {
                let teamInBoard = yield trello_1.default.addListToBoard(board.id, list.name);
                item.sideLists[index].listId = teamInBoard.id;
            })));
            return item;
        })))
            .then((res) => {
            return res;
        })
            .catch((err) => {
            console.log({ notExistedOnTrelloError: err });
            return [];
        });
        allDepartments = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            let index = lodash_1.default.findIndex(notExistedOnTrello, { _id: item._id });
            return index >= 0 ? notExistedOnTrello[index] : item;
        });
        // // Not Existed on TTP > create it on TTP
        notExistedOnTTP = allBoards.filter((item) => !depsIds.includes(item.id));
        newDeps = yield Promise.all(yield (notExistedOnTTP === null || notExistedOnTTP === void 0 ? void 0 : notExistedOnTTP.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let lists = yield trello_1.default.__getBoardLists(item.id);
            item.lists = lists;
            listTypes = Department_2.ListTypes;
            let teams = lists.filter((item) => !listTypes.includes(item.name));
            return new Department_1.default({
                boardId: item.id,
                name: item.name,
                color: "blue",
                lists: yield Promise.all(listTypes === null || listTypes === void 0 ? void 0 : listTypes.map((listName) => __awaiter(void 0, void 0, void 0, function* () {
                    var _b, _c, _d;
                    listExisted = (_b = item === null || item === void 0 ? void 0 : item.lists) === null || _b === void 0 ? void 0 : _b.find((list) => listName === list.name);
                    let listId = (_c = listExisted === null || listExisted === void 0 ? void 0 : listExisted.id) !== null && _c !== void 0 ? _c : (_d = (yield trello_1.default.addListToBoard(item.id, listName))) === null || _d === void 0 ? void 0 : _d.id;
                    return {
                        name: listName,
                        listId: listId,
                    };
                }))),
                // in case of creating any MAIN list (Main > Tasks Board) ,
                // and for any reason this list wasn't created by the webhook of trello as a sideList.
                // In the next initialization time it will be considered as a Team.
                teams: teams === null || teams === void 0 ? void 0 : teams.map((tem) => {
                    return { name: tem.name, listId: tem.id, isDeleted: tem.closed };
                }),
            });
        }))))
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return [];
        })
            .finally(() => {
            return [];
        });
        // existed on TTP & TRELLO > make it same
        intersection = yield Promise.all(intersection === null || intersection === void 0 ? void 0 : intersection.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _e;
            let board = allBoards === null || allBoards === void 0 ? void 0 : allBoards.find((board) => board.id === item.boardId);
            board.lists = yield trello_1.default.__getBoardLists(board.id);
            listTypes = Department_2.ListTypes;
            item.name = board.name;
            item.boardId = board.id;
            item.lists = yield Promise.all(listTypes === null || listTypes === void 0 ? void 0 : listTypes.map((listName) => __awaiter(void 0, void 0, void 0, function* () {
                var _f;
                let listExisted = (_f = board === null || board === void 0 ? void 0 : board.lists) === null || _f === void 0 ? void 0 : _f.find((list) => listName === list.name && list.closed === false);
                let list = item.lists.find((i) => i.name === listName);
                let listId = listExisted
                    ? listExisted.id
                    : (yield trello_1.default.addListToBoard(board.id, listName)).id;
                list.listId = listId;
                return list;
            })));
            let sideListsIds = item.sideLists.map((i) => i.listId);
            let teamsLists = (_e = board.lists) === null || _e === void 0 ? void 0 : _e.filter((item) => !listTypes.includes(item.name) && !sideListsIds.includes(item.id));
            teamsLists === null || teamsLists === void 0 ? void 0 : teamsLists.forEach((list) => {
                let teamIndex = item.teams.findIndex((i) => i.listId === list.id);
                if (teamIndex >= 0) {
                    item.teams[teamIndex].isDeleted = list.closed;
                    item.teams[teamIndex].name = list.name;
                }
                else {
                    item.teams.push({
                        name: list.name,
                        listId: list.id,
                        isDeleted: list.closed,
                    });
                }
            });
            item.sideLists = yield Promise.all(item.sideLists.map((sideI) => __awaiter(void 0, void 0, void 0, function* () {
                let listExisted = board.lists.find((i) => i.id === sideI.listId && i.closed === false);
                let listID = listExisted
                    ? listExisted.id
                    : (yield trello_1.default.addListToBoard(board.id, sideI.name))
                        .id;
                sideI.listId = listID;
                return sideI;
            })));
            return item;
        })))
            .then((res) => {
            return res;
        })
            .catch((err) => {
            return [];
        })
            .finally(() => {
            return [];
        });
        allDepartments = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            let index = intersection.findIndex((dep) => dep._id === item._id);
            return index >= 0 ? intersection[index] : item;
        });
        let creativeBoard = allDepartments.find((i) => i.name === config_1.default.get("CreativeBoard"));
        if (!creativeBoard && !creativeBoard.name)
            yield (0, exports.createTTPCreativeMainBoard)();
        let update = [
            ...allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: {
                            name: item.name,
                            boardId: item.boardId,
                            color: item.color,
                            teams: item.teams,
                            lists: item.lists,
                            sideLists: item === null || item === void 0 ? void 0 : item.sideLists,
                        },
                        upsert: true,
                    },
                };
            }),
            ...newDeps === null || newDeps === void 0 ? void 0 : newDeps.map((item) => {
                return {
                    insertOne: {
                        document: item,
                    },
                };
            }),
        ];
        Department_1.default.bulkWrite(update, {}).catch((err) => {
            console.log({ err: err.writeErrors[0].err });
        });
        allDepartments.forEach((item) => __awaiter(void 0, void 0, void 0, function* () { return trello_1.default.__addWebHook(item.boardId, "trelloWebhookUrlTask"); }));
    }
    catch (error) {
        logger_1.default.error(error);
    }
});
exports.initializeTrelloBoards = initializeTrelloBoards;
const initializeTTPTasks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let tasks, boards, departments, creativeDepartment, projectsListId, cards, cardsIds, tasksIds, intersection, notExistedOnTrello, notExistedOnTTP;
        // get the data
        boards = yield trello_1.default.getBoardsInTrello("all");
        boards = yield Promise.all(boards === null || boards === void 0 ? void 0 : boards.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let lists = yield trello_1.default.__getBoardLists(item.id);
            item.lists = lists;
            return item;
        })));
        departments = yield Department_1.default.find({});
        tasks = yield Task_1.default.find({});
        cards = lodash_1.default.flattenDeep(yield Promise.all(boards === null || boards === void 0 ? void 0 : boards.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let boardCards = yield trello_1.default.__getCardsInBoard(item.id);
            return boardCards;
        }))));
        cards = yield Promise.all(cards === null || cards === void 0 ? void 0 : cards.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let attachments = yield trello_1.default.__getCardAttachments(item.id);
            item.attachments = attachments !== null && attachments !== void 0 ? attachments : [];
            return item;
        })));
        tasksIds = tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => item.cardId);
        cardsIds = cards === null || cards === void 0 ? void 0 : cards.map((item) => item.id);
        notExistedOnTTP = cards.filter((item) => !tasksIds.includes(item.id));
        notExistedOnTrello = tasks.filter((item) => !cardsIds.includes(item.cardId));
        intersection = tasks.filter((item) => cardsIds.includes(item.cardId));
        // execute the function
        // Existed on TTP & Trello > make it same
        intersection = yield Promise.all(intersection === null || intersection === void 0 ? void 0 : intersection.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
            let card = cards === null || cards === void 0 ? void 0 : cards.find((c) => c.id === item.cardId);
            let isBoardArchived = ((_g = boards.find((i) => i.id === card.idBoard)) === null || _g === void 0 ? void 0 : _g.closed) === true
                ? true
                : false !== null && false !== void 0 ? false : true;
            let isListArchived = ((_k = (_j = (_h = boards === null || boards === void 0 ? void 0 : boards.find((i) => i.id === card.idBoard)) === null || _h === void 0 ? void 0 : _h.lists) === null || _j === void 0 ? void 0 : _j.find((l) => l.id === card.idList)) === null || _k === void 0 ? void 0 : _k.closed) === true
                ? true
                : false !== null && false !== void 0 ? false : true;
            let dep = departments === null || departments === void 0 ? void 0 : departments.find((d) => d.boardId === (card === null || card === void 0 ? void 0 : card.idBoard));
            let status = isBoardArchived || isListArchived
                ? null
                : (_l = dep === null || dep === void 0 ? void 0 : dep.lists) === null || _l === void 0 ? void 0 : _l.find((list) => (list === null || list === void 0 ? void 0 : list.listId) === (card === null || card === void 0 ? void 0 : card.idList));
            let team = isBoardArchived || isListArchived
                ? null
                : (_m = dep === null || dep === void 0 ? void 0 : dep.teams) === null || _m === void 0 ? void 0 : _m.find((team) => (team === null || team === void 0 ? void 0 : team.listId) === (card === null || card === void 0 ? void 0 : card.idList));
            let sideList = isBoardArchived || isListArchived
                ? null
                : dep === null || dep === void 0 ? void 0 : dep.sideLists.find((sideList) => (sideList === null || sideList === void 0 ? void 0 : sideList.listId) === card.idList);
            let { movements, currentTeam } = yield task_1.default.getActionsOfTask(card.id, departments, card.due);
            let replacement = new Task_1.default({
                _id: item._id,
                name: decodeURIComponent(card.name),
                categoryId: item.categoryId,
                subCategoryId: item.subCategoryId,
                boardId: card.idBoard,
                projectId: item.projectId,
                listId: card.idList,
                status: sideList
                    ? "Tasks Board"
                    : status
                        ? status.name
                        : team
                            ? "In Progress"
                            : "",
                teamId: (_q = (_p = (_o = team === null || team === void 0 ? void 0 : team._id) !== null && _o !== void 0 ? _o : currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam._id) !== null && _p !== void 0 ? _p : item.teamId) !== null && _q !== void 0 ? _q : null,
                teamListId: (_t = (_s = (_r = team === null || team === void 0 ? void 0 : team.listId) !== null && _r !== void 0 ? _r : currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam.listId) !== null && _s !== void 0 ? _s : item.teamListId) !== null && _t !== void 0 ? _t : null,
                cardId: card.id,
                description: (_v = (_u = card.desc) !== null && _u !== void 0 ? _u : item.description) !== null && _v !== void 0 ? _v : "",
                start: card.start,
                deadline: (_w = card.due) !== null && _w !== void 0 ? _w : null,
                trelloShortUrl: (_x = card.shortUrl) !== null && _x !== void 0 ? _x : "",
                archivedCard: isBoardArchived || isListArchived || card.closed,
                movements: isBoardArchived || isListArchived || card.closed ? [] : movements,
                attachedFiles: ((_y = card === null || card === void 0 ? void 0 : card.attachments) === null || _y === void 0 ? void 0 : _y.length) > 0
                    ? (_z = card === null || card === void 0 ? void 0 : card.attachments) === null || _z === void 0 ? void 0 : _z.map((item) => {
                        return {
                            name: item.fileName,
                            trelloId: item.id,
                            mimeType: item.mimeType,
                            url: item.url,
                        };
                    })
                    : [],
            });
            return replacement;
        })));
        tasks = tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => {
            let index = intersection === null || intersection === void 0 ? void 0 : intersection.findIndex((task) => task._id === item._id);
            return index >= 0 ? intersection[index] : item;
        });
        // // not Existed on TTP > create it on TTP
        let newTasks = yield Promise.all([
            ...notExistedOnTTP === null || notExistedOnTTP === void 0 ? void 0 : notExistedOnTTP.map((card) => __awaiter(void 0, void 0, void 0, function* () {
                var _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13, _14;
                let isBoardArchived = ((_0 = boards.find((i) => i.id === card.idBoard)) === null || _0 === void 0 ? void 0 : _0.closed) === true
                    ? true
                    : false !== null && false !== void 0 ? false : true;
                let isListArchived = ((_3 = (_2 = (_1 = boards
                    .find((i) => i.id === card.idBoard)) === null || _1 === void 0 ? void 0 : _1.lists) === null || _2 === void 0 ? void 0 : _2.find((l) => l.id === card.idList)) === null || _3 === void 0 ? void 0 : _3.closed) === true
                    ? true
                    : false !== null && false !== void 0 ? false : true;
                let dep = isBoardArchived || isListArchived
                    ? null
                    : departments === null || departments === void 0 ? void 0 : departments.find((d) => d.boardId === card.idBoard);
                let status = isBoardArchived || isListArchived
                    ? null
                    : (_4 = dep === null || dep === void 0 ? void 0 : dep.lists) === null || _4 === void 0 ? void 0 : _4.find((list) => list.listId === card.idList);
                let team = isBoardArchived || isListArchived
                    ? null
                    : (_5 = dep === null || dep === void 0 ? void 0 : dep.teams) === null || _5 === void 0 ? void 0 : _5.find((team) => team.listId === card.idList);
                let sideList = isBoardArchived || isListArchived
                    ? null
                    : dep === null || dep === void 0 ? void 0 : dep.sideLists.find((sideList) => (sideList === null || sideList === void 0 ? void 0 : sideList.listId) === card.idList);
                let { movements, currentTeam } = yield task_1.default.getActionsOfTask(card.id, departments, card.due);
                let task = new Task_1.default({
                    name: decodeURIComponent(card.name),
                    boardId: card.idBoard,
                    listId: card.idList,
                    status: sideList
                        ? "Tasks Board"
                        : status
                            ? status.name
                            : team
                                ? "In Progress"
                                : "",
                    teamId: (_7 = (_6 = team === null || team === void 0 ? void 0 : team._id) !== null && _6 !== void 0 ? _6 : currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam._id) !== null && _7 !== void 0 ? _7 : null,
                    teamListId: (_9 = (_8 = team === null || team === void 0 ? void 0 : team.listId) !== null && _8 !== void 0 ? _8 : currentTeam === null || currentTeam === void 0 ? void 0 : currentTeam.listId) !== null && _9 !== void 0 ? _9 : null,
                    cardId: card.id,
                    description: (_10 = decodeURIComponent(card === null || card === void 0 ? void 0 : card.desc)) !== null && _10 !== void 0 ? _10 : "",
                    start: (_11 = card === null || card === void 0 ? void 0 : card.start) !== null && _11 !== void 0 ? _11 : null,
                    deadline: (_12 = card === null || card === void 0 ? void 0 : card.due) !== null && _12 !== void 0 ? _12 : null,
                    trelloShortUrl: card === null || card === void 0 ? void 0 : card.shortUrl,
                    archivedCard: isBoardArchived || isListArchived || card.closed,
                    attachedFiles: ((_13 = card === null || card === void 0 ? void 0 : card.attachments) === null || _13 === void 0 ? void 0 : _13.length)
                        ? (_14 = card === null || card === void 0 ? void 0 : card.attachments) === null || _14 === void 0 ? void 0 : _14.map((item) => {
                            return {
                                name: item === null || item === void 0 ? void 0 : item.fileName,
                                trelloId: item === null || item === void 0 ? void 0 : item.id,
                                mimeType: item === null || item === void 0 ? void 0 : item.mimeType,
                                url: item === null || item === void 0 ? void 0 : item.url,
                            };
                        })
                        : [],
                    movements: isBoardArchived || isListArchived || (card === null || card === void 0 ? void 0 : card.closed) ? [] : movements,
                });
                return task;
            })),
        ]);
        /**
         *   -_-    (Improtant comment)     -_- (((((((((((((((((((())))))))))))))))))))
         * Not existed on trello should ne stopped till implement the way of getting the movements of trello back to trello
         *
         * */
        // // // not Existed on Trello > create it on Trello
        notExistedOnTrello = notExistedOnTrello.filter((i) => i.archivedCard === false);
        let creativeBoard = boards.find((board) => board.name === config_1.default.get("CreativeBoard"));
        notExistedOnTrello = yield Promise.all(notExistedOnTrello === null || notExistedOnTrello === void 0 ? void 0 : notExistedOnTrello.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _15, _16, _17, _18, _19, _20;
            let isBoardArchived = ((_15 = boards.find((i) => i.id === item.boardId)) === null || _15 === void 0 ? void 0 : _15.closed) === true
                ? true
                : false !== null && false !== void 0 ? false : true;
            let isListArchived = ((_18 = (_17 = (_16 = boards
                .find((i) => i.id === item.boardId)) === null || _16 === void 0 ? void 0 : _16.lists) === null || _17 === void 0 ? void 0 : _17.find((i) => i.id === (item === null || item === void 0 ? void 0 : item.listId))) === null || _18 === void 0 ? void 0 : _18.closed) === true
                ? true
                : false !== null && false !== void 0 ? false : true;
            let board = isBoardArchived || isListArchived
                ? creativeBoard
                : boards.find((i) => i.id === item.boardId);
            let list = isBoardArchived || isListArchived
                ? creativeBoard.lists.find((i) => i.name === item.status)
                : (_20 = (_19 = boards
                    .find((i) => i.id === item.boardId)) === null || _19 === void 0 ? void 0 : _19.lists) === null || _20 === void 0 ? void 0 : _20.find((i) => i.id === item.listId);
            item.archivedCard = true;
            return item;
            // if (list && board) {
            //   let card: Card = await TrelloController.__createCard({
            //     boardId: board.id,
            //     listId: list.id,
            //     description: item?.description ? item.description : "",
            //     deadline: item.deadline,
            //     start: item?.start,
            //     name: item.name,
            //   });
            //   item._id = item._id;
            //   item.boardId = board.id ? board.id : creativeBoard.id;
            //   item.listId = list.id;
            //   item.movements =
            //     item?.movements?.length > 0
            //       ? item.movements
            //       : [
            //           {
            //             movedAt: new Date(Date.now()).toString(),
            //             status: item?.status,
            //           },
            //         ];
            //   item.name = item.name;
            //   item.status = item.status;
            //   item.teamId = item.teamId;
            //   item.cardId = card.id;
            //   item.description = item.description;
            //   item.start = item.start ? item.start : null;
            //   item.deadline = item.deadline;
            //   item.trelloShortUrl = card.shortUrl;
            //   item.attachedFiles = [];
            //   item.projectId = item.projectId;
            //   item.categoryId = item.categoryId;
            //   item.subCategoryId = item.subCategoryId;
            //   return item;
            // }
        })));
        notExistedOnTrello = notExistedOnTrello.filter((i) => i !== null);
        tasks = tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => {
            let index = notExistedOnTrello.findIndex((i) => i._id === item._id);
            return index >= 0 ? notExistedOnTrello[index] : item;
        });
        let update = [
            ...newTasks === null || newTasks === void 0 ? void 0 : newTasks.map((item) => {
                return {
                    insertOne: {
                        document: item,
                    },
                };
            }),
            ...tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: {
                            name: item.name,
                            projectId: item.projectId,
                            categoryId: item.categoryId,
                            subCategoryId: item.subCategoryId,
                            teamId: item.teamId,
                            listId: item.listId,
                            status: item.status,
                            start: item.start ? item.start : null,
                            deadline: item.deadline,
                            cardId: item.cardId,
                            boardId: item.boardId,
                            description: (item === null || item === void 0 ? void 0 : item.description) ? item.description : "",
                            trelloShortUrl: item.trelloShortUrl,
                            attachedFiles: item.attachedFiles,
                            movements: item.movements,
                            archivedCard: item.archivedCard,
                        },
                    },
                };
            }),
        ];
        Task_1.default.bulkWrite(update, {});
        console.log("update hooks");
        tasks.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
            trello_1.default.__addWebHook(item.cardId, "trelloWebhookUrlTask");
        }));
    }
    catch (error) {
        logger_1.default.error({ error });
    }
});
exports.initializeTTPTasks = initializeTTPTasks;
const createTTPCreativeMainBoard = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let dep = {
            name: config_1.default.get("CreativeBoard"),
            color: "orange",
        };
        let department = yield department_1.default.createDepartment(dep);
    }
    catch (error) {
        logger_1.default.error({ createTTPCreativeMainBoardError: error });
    }
});
exports.createTTPCreativeMainBoard = createTTPCreativeMainBoard;
exports.default = mongoDB;
