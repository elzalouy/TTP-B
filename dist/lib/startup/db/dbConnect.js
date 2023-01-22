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
exports.createTTPCreativeMainBoard = exports.initializeTrelloBoards = void 0;
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
const initializeTrelloBoards = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let allBoards = yield trello_1.default.getBoardsInTrello();
        let allDepartments = yield Department_1.default.find({});
        if ((allBoards === null || allBoards === void 0 ? void 0 : allBoards.length) > 0) {
            if (!allBoards.find((item) => item.name === config_1.default.get("CreativeBoard")))
                yield (0, exports.createTTPCreativeMainBoard)();
            allBoards.forEach((boardItem, index) => __awaiter(void 0, void 0, void 0, function* () {
                let boardInfo = yield trello_1.default.getSingleBoardInfo(boardItem.id);
                boardItem = allBoards[index] = Object.assign(Object.assign({}, allBoards[index]), { lists: yield trello_1.default.__getBoardLists(boardItem.id) });
                let listTypes = boardItem.name === config_1.default.get("CreativeBoard")
                    ? Department_2.CreativeListTypes
                    : Department_2.ListTypes;
                let departmentExisted = allDepartments.find((item) => item.boardId === boardItem.id);
                let department = {
                    name: boardItem.name,
                    boardId: boardItem.id,
                    color: boardInfo.prefs.background,
                    lists: yield Promise.all(listTypes.map((listName) => __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        let listExisted = (_a = boardItem === null || boardItem === void 0 ? void 0 : boardItem.lists) === null || _a === void 0 ? void 0 : _a.find((item) => listName === item.name);
                        return {
                            name: listName,
                            listId: listExisted && (listExisted === null || listExisted === void 0 ? void 0 : listExisted.id)
                                ? listExisted.id
                                : yield trello_1.default.addListToBoard(boardItem.id, listName).then((res) => {
                                    return res.id;
                                }),
                        };
                    }))),
                    teams: boardItem.lists
                        .filter((item) => !listTypes.includes(item.name))
                        .map((item) => {
                        return { name: item.name, listId: item.id, isDeleted: false };
                    }),
                };
                if (!departmentExisted) {
                    department = yield new Department_1.default(department).save();
                    yield trello_1.default.__addWebHook(department.boardId, "trelloWebhookUrlTask");
                }
                else {
                    let id = departmentExisted._id;
                    department = yield Department_1.default.findOneAndUpdate({ _id: id }, Object.assign({}, department), { new: true });
                    yield trello_1.default.__addWebHook(department.boardId, "trelloWebhookUrlTask");
                }
                yield task_1.default.__createNotSavedCardsOnBoard(department);
            }));
        }
        else
            (0, exports.createTTPCreativeMainBoard)();
    }
    catch (error) {
        logger_1.default.error(error);
    }
});
exports.initializeTrelloBoards = initializeTrelloBoards;
exports.default = mongoDB;
const createTTPCreativeMainBoard = () => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        let dep = {
            name: config_1.default.get("CreativeBoard"),
            color: "orange",
        };
        let department = yield department_1.default.createDepartment(dep);
        let listOfProjects = department &&
            (department === null || department === void 0 ? void 0 : department.lists) &&
            ((_b = department === null || department === void 0 ? void 0 : department.lists) === null || _b === void 0 ? void 0 : _b.find((item) => item.name === "projects"));
        if (department && listOfProjects) {
            (0, department_actions_queue_1.createProjectsCardsInCreativeBoard)(department);
        }
    }
    catch (error) {
        logger_1.default.error({ createTTPCreativeMainBoardError: error });
    }
});
exports.createTTPCreativeMainBoard = createTTPCreativeMainBoard;
