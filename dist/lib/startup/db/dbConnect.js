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
const department_actions_queue_1 = require("../../backgroundJobs/actions/department.actions.queue");
const Department_2 = require("../../types/model/Department");
const lodash_1 = __importDefault(require("lodash"));
const Task_1 = __importDefault(require("../../models/Task"));
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
        // let members = await TrelloActionsController.__getAllMembers();
    }
    catch (error) {
        logger_1.default.error(error);
    }
});
exports.initializeTrelloMembers = initializeTrelloMembers;
const initializeTrelloBoards = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let allBoards, allDepartments, listTypes, listExisted, boardsIds, depsIds, notExistedOnTTP, notExistedOnTrello, intersection;
        allBoards = yield trello_1.default.getBoardsInTrello();
        boardsIds = allBoards === null || allBoards === void 0 ? void 0 : allBoards.map((item) => item.id);
        allDepartments = yield Department_1.default.find({});
        depsIds = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => item.boardId);
        intersection = allDepartments.filter((item) => boardsIds.includes(item.boardId));
        // Not Existed on Trello > create it on trello
        notExistedOnTrello = allDepartments.filter((item) => !boardsIds.includes(item.boardId));
        notExistedOnTrello = yield Promise.all(lodash_1.default.flatMap(notExistedOnTrello, (item) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            let board = yield trello_1.default.createNewBoard(item.name, item.color);
            item.boardId = board.id;
            listTypes =
                item.name === config_1.default.get("CreativeBoard")
                    ? Department_2.CreativeListTypes
                    : Department_2.ListTypes;
            item.lists = yield Promise.all((_a = item.lists) === null || _a === void 0 ? void 0 : _a.map((list) => __awaiter(void 0, void 0, void 0, function* () {
                let listInBoard = yield trello_1.default.addListToBoard(board.id, list.name);
                list.listId = listInBoard.id;
                return list;
            })));
            item.teams = yield Promise.all((_b = item.teams) === null || _b === void 0 ? void 0 : _b.map((team) => __awaiter(void 0, void 0, void 0, function* () {
                let teamInBoard = yield trello_1.default.addListToBoard(board.id, team.name);
                team.listId = teamInBoard.id;
                return team;
            })));
            return item;
        })));
        allDepartments = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            let index = lodash_1.default.findIndex(notExistedOnTrello, { boardId: item.boardId });
            return index >= 0 ? notExistedOnTrello[index] : item;
        });
        // Not Existed on TTP > create it on TTP
        notExistedOnTTP = allBoards.filter((item) => !depsIds.includes(item.id));
        let newDeps = yield Promise.all(notExistedOnTTP === null || notExistedOnTTP === void 0 ? void 0 : notExistedOnTTP.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let lists = yield trello_1.default.__getBoardLists(item.id);
            item.lists = lists;
            listTypes =
                item.name === config_1.default.get("CreativeBoard")
                    ? Department_2.CreativeListTypes
                    : Department_2.ListTypes;
            let teams = lists.filter((item) => !listTypes.includes(item.name));
            return new Department_1.default({
                boardId: item.id,
                name: item.name,
                color: "blue",
                lists: yield Promise.all(listTypes === null || listTypes === void 0 ? void 0 : listTypes.map((listName) => __awaiter(void 0, void 0, void 0, function* () {
                    var _c;
                    listExisted = (_c = item === null || item === void 0 ? void 0 : item.lists) === null || _c === void 0 ? void 0 : _c.find((list) => listName === list.name);
                    return {
                        name: listName,
                        listId: listExisted && (listExisted === null || listExisted === void 0 ? void 0 : listExisted.id)
                            ? listExisted.id
                            : yield trello_1.default.addListToBoard(item.id, listName).then((res) => {
                                return res.id;
                            }),
                    };
                }))),
                teams: teams === null || teams === void 0 ? void 0 : teams.map((tem) => {
                    return { name: tem.name, listId: tem.id, isDeleted: false };
                }),
            });
        })));
        // existed on TTP & TRELLO > make it same
        intersection = yield Promise.all(intersection === null || intersection === void 0 ? void 0 : intersection.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _d, _e;
            let board = allBoards === null || allBoards === void 0 ? void 0 : allBoards.find((board) => board.id === item.boardId);
            board.lists = yield trello_1.default.__getBoardLists(item.boardId);
            listTypes =
                item.name === config_1.default.get("CreativeBoard")
                    ? Department_2.CreativeListTypes
                    : Department_2.ListTypes;
            item.lists = yield Promise.all(listTypes === null || listTypes === void 0 ? void 0 : listTypes.map((listName) => __awaiter(void 0, void 0, void 0, function* () {
                var _f;
                let listExisted = (_f = board === null || board === void 0 ? void 0 : board.lists) === null || _f === void 0 ? void 0 : _f.find((list) => listName === list.name);
                return {
                    name: listName,
                    listId: listExisted && (listExisted === null || listExisted === void 0 ? void 0 : listExisted.id)
                        ? listExisted.id
                        : yield trello_1.default.addListToBoard(item.boardId, listName).then((res) => {
                            return res.id;
                        }),
                };
            })));
            item.teams = (_e = (_d = board.lists) === null || _d === void 0 ? void 0 : _d.filter((item) => !listTypes.includes(item.name))) === null || _e === void 0 ? void 0 : _e.map((item) => {
                return { name: item.name, listId: item.id, isDeleted: false };
            });
            return item;
        })));
        allDepartments = allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            let index = intersection.findIndex((dep) => dep._id === item._id);
            return index >= 0 ? intersection[index] : item;
        });
        let updateTeams = lodash_1.default.flattenDeep(allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            var _a;
            return (_a = item.teams) === null || _a === void 0 ? void 0 : _a.map((team) => {
                return {
                    updateOne: {
                        filter: { _id: item._id, "teams.listId": team.listId },
                        update: {
                            $set: {
                                "teams.$.listId": team.listId,
                                "teams.$.name": team.name,
                                "teams.$.isDeleted": team.isDeleted,
                            },
                        },
                    },
                };
            });
        }));
        let updateLists = lodash_1.default.flattenDeep(allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
            var _a;
            return (_a = item.lists) === null || _a === void 0 ? void 0 : _a.map((list) => {
                return {
                    updateOne: {
                        filter: { _id: item._id, "lists._id": list._id },
                        update: {
                            $set: {
                                "lists.$.listId": list.listId,
                                "lists.$.name": list.name,
                            },
                        },
                    },
                };
            });
        }));
        let update = [
            ...updateLists,
            ...updateTeams,
            ...allDepartments === null || allDepartments === void 0 ? void 0 : allDepartments.map((item) => {
                return {
                    updateOne: {
                        filter: { _id: item._id },
                        update: {
                            name: item.name,
                            boardId: item.boardId,
                            color: item.color,
                        },
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
        console.log({ allDepartments, update, teams: allDepartments[0].teams });
        yield Department_1.default.bulkWrite(update);
        yield allDepartments.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
            return yield trello_1.default.__addWebHook(item.boardId, "trelloWebhookUrlTask");
        }));
    }
    catch (error) {
        logger_1.default.error(error);
    }
});
exports.initializeTrelloBoards = initializeTrelloBoards;
const initializeTTPTasks = () => __awaiter(void 0, void 0, void 0, function* () {
    var _g, _h;
    try {
        let tasks, boards, departments, creativeBoard, creativeDepartment, projectsListId, cards, cardsIds, tasksIds, intersection, notExistedOnTrello, notExistedOnTTP;
        // get the data
        boards = yield trello_1.default.getBoardsInTrello();
        boards = yield Promise.all(boards === null || boards === void 0 ? void 0 : boards.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            let lists = yield trello_1.default.__getBoardLists(item.id);
            item.lists = lists;
            return item;
        })));
        departments = yield Department_1.default.find({});
        creativeBoard = boards === null || boards === void 0 ? void 0 : boards.find((item) => item.name === config_1.default.get("CreativeBoard"));
        tasks = yield Task_1.default.find({});
        creativeDepartment = yield Department_1.default.findOne({
            boardId: creativeBoard === null || creativeBoard === void 0 ? void 0 : creativeBoard.id,
        });
        projectsListId = (_h = (_g = creativeDepartment === null || creativeDepartment === void 0 ? void 0 : creativeDepartment.lists) === null || _g === void 0 ? void 0 : _g.find((item) => item.name === "projects")) === null || _h === void 0 ? void 0 : _h._id;
        let newCards = yield Promise.all(boards === null || boards === void 0 ? void 0 : boards.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _j;
            let boardCards = yield trello_1.default.__getCardsInBoard(item.id);
            if (item.name === config_1.default.get("CreativeBoard")) {
                let list = (_j = item === null || item === void 0 ? void 0 : item.lists) === null || _j === void 0 ? void 0 : _j.find((l) => l.name === "projects").id;
                boardCards = boardCards.filter((item) => item.idList !== list);
            }
            return boardCards;
        })));
        cards = lodash_1.default.flattenDeep(newCards);
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
            var _k, _l, _m, _o, _p, _q, _r;
            let card = cards === null || cards === void 0 ? void 0 : cards.find((c) => c.id === item.cardId);
            let dep = departments === null || departments === void 0 ? void 0 : departments.find((d) => d.boardId === card.idBoard);
            let status = (_k = dep.lists) === null || _k === void 0 ? void 0 : _k.find((list) => list.listId === card.idList);
            let team = (_l = dep.teams) === null || _l === void 0 ? void 0 : _l.find((team) => team.listId === card.idList);
            let replacement = new Task_1.default({
                _id: item._id,
                name: item.name,
                categoryId: item.categoryId,
                subCategoryId: item.subCategoryId,
                boardId: card.idBoard,
                projectId: item.projectId,
                listId: card.idList,
                status: (_m = status === null || status === void 0 ? void 0 : status.name) !== null && _m !== void 0 ? _m : "In Progress",
                teamId: (_o = team === null || team === void 0 ? void 0 : team._id) !== null && _o !== void 0 ? _o : item.teamId,
                teamListId: (_p = team === null || team === void 0 ? void 0 : team.listId) !== null && _p !== void 0 ? _p : item === null || item === void 0 ? void 0 : item.teamListId,
                cardId: card.id,
                description: card.desc ? card.desc : "",
                start: card.start,
                deadline: card.due ? card.due : null,
                trelloShortUrl: card.shortUrl ? card.shortUrl : "",
                movements: ((_q = item === null || item === void 0 ? void 0 : item.movements) === null || _q === void 0 ? void 0 : _q.length) > 0
                    ? item.movements
                    : [
                        {
                            movedAt: new Date(Date.now()).toString(),
                            status: status.name ? status.name : "In Progress",
                        },
                    ],
                attachedFiles: (_r = card === null || card === void 0 ? void 0 : card.attachments) === null || _r === void 0 ? void 0 : _r.map((item) => {
                    return {
                        name: item.fileName,
                        trelloId: item.id,
                        mimeType: item.mimeType,
                        url: item.url,
                    };
                }),
            });
            return replacement;
        })));
        tasks = tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => {
            let index = intersection === null || intersection === void 0 ? void 0 : intersection.findIndex((task) => task._id === item._id);
            return index >= 0 ? intersection[index] : item;
        });
        // not Existed on TTP > create it on TTP
        let newTasks = [
            ...notExistedOnTTP === null || notExistedOnTTP === void 0 ? void 0 : notExistedOnTTP.map((item) => {
                var _a, _b, _c, _d, _e, _f, _g;
                let dep = departments === null || departments === void 0 ? void 0 : departments.find((d) => d.boardId === item.idBoard);
                let status = (_a = dep === null || dep === void 0 ? void 0 : dep.lists) === null || _a === void 0 ? void 0 : _a.find((list) => list.listId === item.idList);
                let team = (_b = dep === null || dep === void 0 ? void 0 : dep.teams) === null || _b === void 0 ? void 0 : _b.find((team) => team.listId === item.idList);
                let task = new Task_1.default({
                    name: item.name,
                    boardId: item.idBoard,
                    listId: (_c = status === null || status === void 0 ? void 0 : status.listId) !== null && _c !== void 0 ? _c : team === null || team === void 0 ? void 0 : team.listId,
                    status: (_d = status === null || status === void 0 ? void 0 : status.name) !== null && _d !== void 0 ? _d : "In Progress",
                    teamId: (_e = team === null || team === void 0 ? void 0 : team._id) !== null && _e !== void 0 ? _e : null,
                    cardId: item.id,
                    description: (_f = item.desc) !== null && _f !== void 0 ? _f : "",
                    start: item.start ? item.start : null,
                    deadline: item.due,
                    trelloShortUrl: item.shortUrl,
                    attachedFiles: item.attachments.length > 0
                        ? (_g = item === null || item === void 0 ? void 0 : item.attachments) === null || _g === void 0 ? void 0 : _g.map((item) => {
                            return {
                                name: item.fileName,
                                trelloId: item.id,
                                mimeType: item.mimeType,
                                url: item.url,
                            };
                        })
                        : [],
                    movements: [
                        {
                            status: (status === null || status === void 0 ? void 0 : status.name) ? status.name : "In Progress",
                            movedAt: new Date(Date.now()).toString(),
                        },
                    ],
                });
                return task;
            }),
        ];
        tasks = [...tasks, ...newTasks];
        // not Existed on Trello > create it on Trello
        notExistedOnTrello = yield Promise.all(notExistedOnTrello === null || notExistedOnTrello === void 0 ? void 0 : notExistedOnTrello.map((item) => __awaiter(void 0, void 0, void 0, function* () {
            var _s;
            let board = boards === null || boards === void 0 ? void 0 : boards.find((b) => b.id === item.boardId);
            let boardId = board ? board.id : creativeBoard === null || creativeBoard === void 0 ? void 0 : creativeBoard.id;
            let listId = item.listId;
            let card = yield trello_1.default.__createCard({
                boardId: boardId,
                listId: listId,
                description: (item === null || item === void 0 ? void 0 : item.description) ? item.description : "",
                deadline: item.deadline,
                start: item === null || item === void 0 ? void 0 : item.start,
                name: item.name,
            });
            let replacement = new Task_1.default({
                _id: item._id,
                boardId: boardId,
                listId: listId,
                movements: ((_s = item === null || item === void 0 ? void 0 : item.movements) === null || _s === void 0 ? void 0 : _s.length) > 0
                    ? item.movements
                    : [
                        {
                            movedAt: new Date(Date.now()).toString(),
                            status: item.status,
                        },
                    ],
                name: item.name,
                status: item.status,
                teamId: null,
                cardId: card.id,
                description: item.description,
                start: item.start ? item.start : null,
                deadline: item.deadline,
                trelloShortUrl: card.shortUrl,
                attachedFiles: [],
                projectId: item.projectId,
                categoryId: item.categoryId,
                subCategoryId: item.subCategoryId,
            });
            return replacement;
        })));
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
                            deadlineChain: item.deadlineChain,
                            movements: item.movements,
                        },
                    },
                };
            }),
        ];
        Task_1.default.bulkWrite(update, {});
        yield tasks.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
            yield trello_1.default.__addWebHook(item.cardId, "trelloWebhookUrlTask");
        }));
    }
    catch (error) {
        logger_1.default.error({ error });
    }
});
exports.initializeTTPTasks = initializeTTPTasks;
const createTTPCreativeMainBoard = () => __awaiter(void 0, void 0, void 0, function* () {
    var _t;
    try {
        let dep = {
            name: config_1.default.get("CreativeBoard"),
            color: "orange",
        };
        let department = yield department_1.default.createDepartment(dep);
        let listOfProjects = department &&
            (department === null || department === void 0 ? void 0 : department.lists) &&
            ((_t = department === null || department === void 0 ? void 0 : department.lists) === null || _t === void 0 ? void 0 : _t.find((item) => item.name === "projects"));
        if (department && listOfProjects) {
            (0, department_actions_queue_1.createProjectsCardsInCreativeBoard)(department);
        }
    }
    catch (error) {
        logger_1.default.error({ createTTPCreativeMainBoardError: error });
    }
});
exports.createTTPCreativeMainBoard = createTTPCreativeMainBoard;
exports.default = mongoDB;
