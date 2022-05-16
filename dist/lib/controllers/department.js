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
const department_1 = __importDefault(require("../dbCalls/department/department"));
const techMember_1 = __importDefault(require("../dbCalls/techMember/techMember"));
const boards_1 = __importDefault(require("./boards"));
const DepartmentController = class DepartmentController extends department_1.default {
    static createDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__createNewDepartment(data);
        });
    }
    static updateDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__updateDepartmentData(data);
        });
    }
    static deleteDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__deleteDepartmentData(data);
        });
    }
    static getDepartments(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__getDepartmentsData(data);
        });
    }
    static __getDepartmentsData(data) {
        const _super = Object.create(null, {
            getDepartmentsData: { get: () => super.getDepartmentsData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let departments = yield _super.getDepartmentsData.call(this, data);
                return departments;
            }
            catch (error) {
                logger_1.default.error({ getDepartmentsError: error });
            }
        });
    }
    static __deleteDepartmentData(data) {
        const _super = Object.create(null, {
            findDepByIdDB: { get: () => super.findDepByIdDB },
            deleteDepartmentDB: { get: () => super.deleteDepartmentDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { _id } = data;
                let myDepartment = yield _super.findDepByIdDB.call(this, _id);
                let teamId = [];
                if (myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.mainBoard) {
                    myDepartment.teamsId.map((team) => {
                        return teamId.push(team.idInTrello);
                    });
                }
                let listTrelloIds = [
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.canceldListId,
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.defaultListId,
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.doneListId,
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.notClearListId,
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.reviewListId,
                    myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.sharedListID,
                    ...teamId,
                ];
                // if it was main Board remove the webhooks
                if (myDepartment.mainBoard) {
                    let hookRemove = listTrelloIds.map((id) => __awaiter(this, void 0, void 0, function* () {
                        return yield boards_1.default.removeWebhook(id);
                    }));
                    logger_1.default.info("third step");
                    Promise.all(hookRemove).then((res) => logger_1.default.info({ removeWebhookSucced: "done" }));
                }
                logger_1.default.info({ boardId: myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.boardId, myDepartment });
                yield boards_1.default.deleteBoard(myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.boardId);
                let deleteDepartment = yield _super.deleteDepartmentDB.call(this, _id);
                return deleteDepartment;
            }
            catch (error) {
                logger_1.default.error({ deleteDepartmentError: error });
            }
        });
    }
    static __updateDepartmentData(data) {
        const _super = Object.create(null, {
            updatedbDepartment: { get: () => super.updatedbDepartment },
            updateNestedRecordDepDB: { get: () => super.updateNestedRecordDepDB }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let depUpdate;
                // update board color and name
                if (data.name && data.color) {
                    logger_1.default.info("first step");
                    let boardData = {
                        name: data.name,
                        color: data.color,
                        _id: data._id,
                    };
                    yield boards_1.default.updateBoard(data.boardId, boardData);
                    depUpdate = yield _super.updatedbDepartment.call(this, boardData);
                }
                // if not undefine then there is an action needed
                // make mainBoard or not
                if (data.mainBoard !== undefined && data.teams) {
                    logger_1.default.info("second step");
                    // if false => remove the webhook
                    if (!data.mainBoard) {
                        let hookRemove = data.teams.map((id) => __awaiter(this, void 0, void 0, function* () {
                            return yield boards_1.default.removeWebhook(id);
                        }));
                        logger_1.default.info("third step");
                        Promise.all(hookRemove).then((res) => logger_1.default.info({ removeWebhookSucced: "done" }));
                    }
                    // if true => create the webhook
                    if (data.mainBoard) {
                        logger_1.default.info("fourth step");
                        let hookAdd = data.teams.map((id) => __awaiter(this, void 0, void 0, function* () {
                            return yield boards_1.default.createWebHook(id);
                        }));
                        Promise.all(hookAdd).then((res) => logger_1.default.info({ addWebhookSucced: "done" }));
                    }
                }
                //todo add team or remove team
                // if remove team
                if (data.removeTeam) {
                    let hookListremove = data.removeTeam.map((id) => __awaiter(this, void 0, void 0, function* () {
                        // remove team list
                        yield boards_1.default.addListToArchieve(id);
                        // remove webhook
                        return yield boards_1.default.removeWebhook(id);
                    }));
                    Promise.all(hookListremove).then((res) => logger_1.default.info({ removeListAndWebhookSucced: "done" }));
                    logger_1.default.info({ removeTeam: data.removeTeam });
                    // remove team
                    depUpdate = yield _super.updateNestedRecordDepDB.call(this, data._id, {
                        $pull: {
                            teamsId: {
                                idInTrello: { $in: data.removeTeam },
                            },
                        },
                    });
                }
                // If add team
                if (data.addTeam) {
                    let teamListIds = yield DepartmentController.__createTeamWebhookAndList(data.addTeam, data.boardId, data.mainBoard);
                    logger_1.default.info({ title: "testing", teamListIds });
                    // add team
                    depUpdate = yield _super.updateNestedRecordDepDB.call(this, data._id, {
                        $push: {
                            teamsId: { $each: teamListIds, $position: 0 },
                        },
                    });
                }
                logger_1.default.info({ depUpdate });
                return depUpdate;
            }
            catch (error) {
                logger_1.default.error({ updateDepartmentError: error });
            }
        });
    }
    static __createNewDepartment(data) {
        const _super = Object.create(null, {
            createdbDepartment: { get: () => super.createdbDepartment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teams = data.teams;
                let mainBoard = data.mainBoard;
                // define the board and list variable
                let boardId = "";
                let defaultListId = "";
                let sharedListID = "";
                let doneListId = "";
                let reviewListId = "";
                let notClearListId = "";
                let canceldListId = "";
                let departmentWindowId = "";
                // create board
                let boardData = yield boards_1.default.createNewBoard(data.name, data.color);
                boardId = boardData.id;
                data = {
                    name: data.name,
                    color: data.color,
                    boardId,
                };
                let departmentCreate = yield _super.createdbDepartment.call(this, data);
                // create main list on board
                let cancel = yield boards_1.default.addListToBoard(boardId, "cancel");
                canceldListId = cancel.id;
                let done = yield boards_1.default.addListToBoard(boardId, "done");
                doneListId = done.id;
                let shared = yield boards_1.default.addListToBoard(boardId, "Shared");
                sharedListID = shared.id;
                let review = yield boards_1.default.addListToBoard(boardId, "Review");
                reviewListId = review.id;
                // create list and webhook for the team
                let teamListIds = yield DepartmentController.__createTeamWebhookAndList(teams, boardId, mainBoard);
                let defaultList = yield boards_1.default.addListToBoard(boardId, "Tasks Board");
                defaultListId = defaultList.id;
                let departmentWindow = yield boards_1.default.addListToBoard(boardId, "Department window");
                departmentWindowId = departmentWindow.id;
                let unClear = yield boards_1.default.addListToBoard(boardId, "Unclear brief");
                notClearListId = unClear.id;
                // create webhook for list
                const listId = [
                    defaultListId,
                    sharedListID,
                    doneListId,
                    reviewListId,
                    notClearListId,
                    canceldListId,
                    departmentWindowId,
                ];
                let webhookCreate = listId.map((id) => __awaiter(this, void 0, void 0, function* () {
                    return yield boards_1.default.createWebHook(id);
                }));
                Promise.all(webhookCreate).then((res) => logger_1.default.info({ webhookCreateResult: "webhook done" }));
                data = {
                    defaultListId,
                    sharedListID,
                    doneListId,
                    reviewListId,
                    notClearListId,
                    canceldListId,
                    departmentWindowId,
                    teamsId: teamListIds,
                };
                let department = yield DepartmentController.__createTeamList(teams, departmentCreate._id, data);
                if (!department) {
                    return null;
                }
                return department;
            }
            catch (error) {
                logger_1.default.error({ createDepartmentError: error });
            }
        });
    }
    // This update department ref in team record in db and update department record
    static __createTeamList(teams, departId, data) {
        const _super = Object.create(null, {
            updatedbDepartment: { get: () => super.updatedbDepartment }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let ids = teams.map((team) => team._id);
                // update team record with the department id
                yield techMember_1.default.updateTechMembersDB({ ids, departmentId: departId });
                // update my department with the ids for the team in trello
                return yield _super.updatedbDepartment.call(this, Object.assign({ _id: departId }, data));
            }
            catch (error) {
                logger_1.default.error({ createTeamListError: error });
            }
        });
    }
    static __createTeamWebhookAndList(teams, boardId, mainBoard) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teamListIds = [];
                if (teams) {
                    let teamsList = teams.map((team) => __awaiter(this, void 0, void 0, function* () {
                        let teamData = yield boards_1.default.addListToBoard(boardId, team.name);
                        if (mainBoard) {
                            boards_1.default.createWebHook(teamData.id);
                        }
                        return teamListIds.push({
                            idInTrello: teamData.id,
                            idInDB: team._id,
                        });
                    }));
                    yield Promise.all(teamsList).then((res) => logger_1.default.info({ removeWebhookSucced: "done" }));
                }
                logger_1.default.info({ teamListIds });
                return teamListIds;
            }
            catch (error) {
                logger_1.default.error({ createTeamListError: error });
            }
        });
    }
};
exports.default = DepartmentController;
