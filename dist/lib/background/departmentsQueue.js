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
exports.createOneJob = exports.DepartmentQueue = void 0;
const queue_1 = __importDefault(require("queue"));
const logger_1 = __importDefault(require("../../logger"));
const trello_1 = __importDefault(require("../controllers/trello"));
const department_1 = __importDefault(require("../controllers/department"));
const index_1 = require("../../index");
exports.DepartmentQueue = (0, queue_1.default)({ results: [] });
/**
 * CreateOne
 *
 * It's a function for pushing a task to the Department Queue for being processed.
 * it takes a turn on the processing queue of this worker.
 * Once the process is done it will return a callback with two paramters error and returned data.
 * If an error just hapenned, it will emit an event to the client using the websocket connection and cancel the create request.
 * @param department DepartmentData
 */
const createOneJob = (department, teams) => {
    exports.DepartmentQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            if (department._id) {
                let defaultListId = "";
                let sharedListID = "";
                let doneListId = "";
                let reviewListId = "";
                let notClearListId = "";
                let canceldListId = "";
                let inProgressListId = "";
                let inprogress = yield trello_1.default.addListToBoard(department.boardId, "inProgress");
                inProgressListId = inprogress.id;
                let cancel = yield trello_1.default.addListToBoard(department.boardId, "Cancled");
                canceldListId = cancel.id;
                let NotClear = yield trello_1.default.addListToBoard(department.boardId, "Not Clear");
                notClearListId = NotClear.id;
                let done = yield trello_1.default.addListToBoard(department.boardId, "Done");
                doneListId = done.id;
                let shared = yield trello_1.default.addListToBoard(department.boardId, "Shared");
                sharedListID = shared.id;
                let review = yield trello_1.default.addListToBoard(department.boardId, "Review");
                reviewListId = review.id;
                let defaultList = yield trello_1.default.addListToBoard(department.boardId, "Tasks Board");
                defaultListId = defaultList.id;
                // // create list and webhook for the team
                let teamListIds = yield department_1.default.__createTeamAndList(teams, department.boardId);
                defaultListId = defaultList.id;
                // create webhook for list
                // const listId: string[] = [
                //   defaultListId,
                //   sharedListID,
                //   doneListId,
                //   reviewListId,
                //   notClearListId,
                //   canceldListId,
                //   inProgressListId,
                // ];
                // let webhookCreate = listId.map(async (id) => {
                //   return await BoardController.createWebHook(id);
                // });
                // Promise.all(webhookCreate).then((res) =>
                //   logger.info({ webhookCreateResult: "webhook done" })
                // );
                let data = {
                    defaultListId,
                    sharedListID,
                    doneListId,
                    reviewListId,
                    notClearListId,
                    canceldListId,
                    inProgressListId,
                    teamsId: teamListIds,
                };
                let result = yield department_1.default.__createTeamList(teams, department._id, data);
                if (!department || !result) {
                    (_a = index_1.io === null || index_1.io === void 0 ? void 0 : index_1.io.sockets) === null || _a === void 0 ? void 0 : _a.emit("new-department-error", { id: department._id });
                    yield trello_1.default.deleteBoard(department.boardId);
                    yield department_1.default.deleteDepartment(department._id);
                    yield cb(new Error("Board was not created"), null);
                }
                (_b = index_1.io === null || index_1.io === void 0 ? void 0 : index_1.io.sockets) === null || _b === void 0 ? void 0 : _b.emit("new-department", result);
                cb(null, result);
            }
        }
        catch (error) {
            // socket event should emit here
            logger_1.default.error({ createDepartmentJobError: error });
        }
    }));
};
exports.createOneJob = createOneJob;
