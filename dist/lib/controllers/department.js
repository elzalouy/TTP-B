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
const departmentsQueue_1 = require("../background/departmentsQueue");
const procedures_1 = __importDefault(require("../db/procedures"));
const department_1 = __importDefault(require("../dbCalls/department/department"));
const trello_1 = __importDefault(require("./trello"));
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
    static getDepartments(data, and) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentController.__getDepartmentsData(data, and);
        });
    }
    static __getDepartmentsData(data, and) {
        const _super = Object.create(null, {
            getDepartmentsData: { get: () => super.getDepartmentsData }
        });
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let departments = yield _super.getDepartmentsData.call(this, data, and);
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
                        return yield trello_1.default.removeWebhook(id);
                    }));
                    Promise.all(hookRemove).then((res) => logger_1.default.info({ removeWebhookSucced: "done" }));
                }
                yield trello_1.default.deleteBoard(myDepartment === null || myDepartment === void 0 ? void 0 : myDepartment.boardId);
                let deleteDepartment = yield _super.deleteDepartmentDB.call(this, _id);
                if (deleteDepartment === null || deleteDepartment === void 0 ? void 0 : deleteDepartment._id) {
                    procedures_1.default.deleteDepartmentProcedure(deleteDepartment);
                    return deleteDepartment;
                }
                else
                    throw "Department With this id not existed";
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
                    yield trello_1.default.updateBoard(data.boardId, boardData);
                    depUpdate = yield _super.updatedbDepartment.call(this, boardData);
                }
                // if not undefine then there is an action needed
                // make mainBoard or not
                // if (data.mainBoard !== undefined && data.teams) {
                //   logger.info("second step");
                //   // if false => remove the webhook
                //   if (!data.mainBoard) {
                //     let hookRemove = data.teams.map(async (id) => {
                //       return await BoardController.removeWebhook(id);
                //     });
                //     logger.info("third step");
                //     Promise.all(hookRemove).then((res) =>
                //       logger.info({ removeWebhookSucced: "done" })
                //     );
                //   }
                //   // if true => create the webhook
                //   if (data.mainBoard) {
                //     logger.info("fourth step");
                //     let hookAdd = data.teams.map(async (id) => {
                //       return await BoardController.createWebHook(id);
                //     });
                //     Promise.all(hookAdd).then((res) =>
                //       logger.info({ addWebhookSucced: "done" })
                //     );
                //   }
                // }
                //todo add team or remove team
                // if remove team
                if (data.removeTeam) {
                    let hookListremove = data.removeTeam.map((id) => __awaiter(this, void 0, void 0, function* () {
                        // remove team list
                        return yield trello_1.default.addListToArchieve(id);
                        // remove webhook
                        // return await BoardController.removeWebhook(id);
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
                    let teamListIds = yield DepartmentController.__createTeamAndList(data.addTeam, data.boardId);
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
                let boardData = yield trello_1.default.createNewBoard(data.name, data.color);
                if (boardData.id) {
                    let departmentResult = yield _super.createdbDepartment.call(this, {
                        name: data.name,
                        color: data.color,
                        boardId: boardData.id,
                        mainBoard: data.mainBoard,
                        boardURL: boardData.url,
                    });
                    (0, departmentsQueue_1.createOneJob)(departmentResult, data.teams);
                    departmentsQueue_1.DepartmentQueue.start();
                    if (!departmentResult._id)
                        return {
                            error: "department",
                            message: "error happened while creating department",
                        };
                    return departmentResult;
                }
                else
                    return {
                        error: "board",
                        message: "error happened while creating board",
                    };
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
                // update team record with the department id (commented out because this is causing a bug)
                /*  await TechMemberDB.updateTechMembersDB({ ids, departmentId: departId }); */
                // update my department with the ids for the team in trello
                return yield _super.updatedbDepartment.call(this, Object.assign({ _id: departId }, data));
            }
            catch (error) {
                logger_1.default.error({ createTeamListError: error });
            }
        });
    }
    static __createTeamAndList(teams, boardId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let teamListIds = [];
                if (teams) {
                    let teamsList = teams.map((team) => __awaiter(this, void 0, void 0, function* () {
                        let teamData = yield trello_1.default.addListToBoard(boardId, team.name);
                        return teamListIds.push({
                            idInTrello: teamData.id,
                            idInDB: team._id,
                            name: team.name,
                        });
                    }));
                    yield Promise.all(teamsList).then((res) => logger_1.default.info({ removeWebhookSucced: "done" }));
                }
                return teamListIds;
            }
            catch (error) {
                logger_1.default.error({ createTeamListError: error });
            }
        });
    }
};
exports.default = DepartmentController;
