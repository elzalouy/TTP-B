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
const bson_1 = require("bson");
const logger_1 = __importDefault(require("../../../logger"));
const Department_1 = __importDefault(require("../../models/Department"));
const DepartmentBD = class DepartmentBD {
    static createdbDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__addNewDepartment(data);
        });
    }
    static updatedbDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__updateDepartment(data);
        });
    }
    static deleteDepartmentDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__deleteDepartment(id);
        });
    }
    static getDepartmentsData(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__getDepartment(data);
        });
    }
    static updateNestedRecordDepDB(DepId, Recordupdate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__updateNestedRecordDepDB(DepId, Recordupdate);
        });
    }
    static findDepByIdDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield DepartmentBD.__findDepByIdDB(id);
        });
    }
    static __findDepByIdDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.findById(id).lean();
                return department;
            }
            catch (error) {
                logger_1.default.error({ findDepByIdDBDBError: error });
            }
        });
    }
    static __updateNestedRecordDepDB(DepId, Recordupdate) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.findOneAndUpdate({ _id: new bson_1.ObjectId(DepId) }, Recordupdate, { new: true, lean: true, populate: "teamsId" });
                return department;
            }
            catch (error) {
                logger_1.default.error({ deleteNestedRecordDepDBError: error });
            }
        });
    }
    static __getDepartment(data) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let department = yield Department_1.default.aggregate([
                    { $match: { $and: [data] } },
                    {
                        $lookup: {
                            from: "tasks",
                            localField: "tasks",
                            foreignField: "_id",
                            as: "tasks",
                        },
                    },
                    {
                        $lookup: {
                            from: "techmembers",
                            localField: "teamsId.idInDB",
                            foreignField: "_id",
                            as: "teamData",
                        },
                    },
                    {
                        $addFields: {
                            totalInProgress: {
                                $filter: {
                                    input: "$tasks",
                                    as: "task",
                                    cond: {
                                        $in: ["$$task.status", ["inProgress", "Shared", "Review"]],
                                    },
                                },
                            },
                            totalDone: {
                                $filter: {
                                    input: "$tasks",
                                    as: "task",
                                    cond: { $eq: ["$$task.status", "Done"] },
                                },
                            },
                        },
                    },
                    {
                        $project: {
                            _id: 1,
                            name: 1,
                            boardId: 1,
                            color: 1,
                            mainBoard: 1,
                            teamsId: "$teamData",
                            teamOrigin: "$teamsId",
                            canceldListId: 1,
                            defaultListId: 1,
                            doneListId: 1,
                            notClearListId: 1,
                            reviewListId: 1,
                            sharedListID: 1,
                            notStartedListId: 1,
                            totalInProgress: {
                                $size: "$totalInProgress",
                            },
                            totalDone: {
                                $size: "$totalDone",
                            },
                        },
                    },
                ]);
                // format my data
                for (let i = 0; i < department.length; i++) {
                    department[i].teamsId = department[i].teamsId.map((team, j) => {
                        var _a, _b;
                        // logger.info({ teamOrigin: department[i].teamOrigin });
                        return Object.assign(Object.assign({}, team), { idInTrello: (_b = (_a = department[i]) === null || _a === void 0 ? void 0 : _a.teamOrigin[j]) === null || _b === void 0 ? void 0 : _b.idInTrello });
                    });
                    (_a = department[i]) === null || _a === void 0 ? true : delete _a.teamOrigin;
                }
                return department;
            }
            catch (error) {
                logger_1.default.error({ getDepartmentDataError: error });
            }
        });
    }
    static __deleteDepartment(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deletedDepartment = yield Department_1.default.findOneAndDelete({ _id: id });
                return deletedDepartment;
            }
            catch (error) {
                logger_1.default.error({ deleteDepartmentError: error });
            }
        });
    }
    static __updateDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data._id;
                delete data._id;
                let department = yield Department_1.default.findByIdAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true, populate: "teamsId" });
                return department;
            }
            catch (error) {
                logger_1.default.error({ updatedbDepartmentError: error });
            }
        });
    }
    static __addNewDepartment(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                logger_1.default.info({ data });
                let department = new Department_1.default(data);
                yield department.save();
                return department;
            }
            catch (error) {
                logger_1.default.error({ createDepartmentError: error });
            }
        });
    }
};
exports.default = DepartmentBD;
