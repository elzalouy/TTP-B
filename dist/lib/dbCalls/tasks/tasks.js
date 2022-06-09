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
const logger_1 = __importDefault(require("../../../logger"));
const task_1 = __importDefault(require("../../models/task"));
const mongoose_1 = __importDefault(require("mongoose"));
const Department_1 = __importDefault(require("../../models/Department"));
class TaskDB {
    static createTaskDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__createTask(data);
        });
    }
    static updateTaskDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__updateTask(data);
        });
    }
    static deleteTaskDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__deleteTask(id);
        });
    }
    static deleteTasksDB(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__deleteTasks(ids);
        });
    }
    static updateOneTaskDB(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__updateOneTaskDB(data, value);
        });
    }
    static getTaskDepartmentDB(depId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getTaskDepartment(depId);
        });
    }
    static deleteTasksByProjectIdDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__deleteTasksByProjectId(id);
        });
    }
    static getTaskDB(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getTask(id);
        });
    }
    static getAllTasksDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getAllTasks(data);
        });
    }
    static deleteTasksWhereDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__deleteTasksWhereDB(data);
        });
    }
    static __getAllTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = task_1.default.find(data).populate("memberId");
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ getAllTasksDBError: error });
            }
        });
    }
    static __getTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findOne({ _id: id });
                console.log(task, id);
                return task;
            }
            catch (error) {
                logger_1.default.error({ updateTaskDBError: error });
            }
        });
    }
    static __getTaskDepartment(depId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let taskCount = yield task_1.default.aggregate([
                    {
                        $facet: {
                            inProgressTasks: [
                                {
                                    $match: {
                                        marchentID: new mongoose_1.default.Types.ObjectId(depId),
                                        status: {
                                            $in: ["inProgress", "shared", "not clear", "review"],
                                        },
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        count: {
                                            $sum: 1,
                                        },
                                    },
                                },
                            ],
                            doneTasks: [
                                {
                                    $match: {
                                        marchentID: new mongoose_1.default.Types.ObjectId(depId),
                                        status: "delivered",
                                    },
                                },
                                {
                                    $group: {
                                        _id: null,
                                        count: {
                                            $sum: 1,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ]);
                return taskCount;
            }
            catch (error) {
                logger_1.default.error({ getTaskDepartmentDBError: error });
            }
        });
    }
    static __updateOneTaskDB(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findOne(data);
                task.lastMove = task.status;
                task.lastMoveDate = new Date().toUTCString();
                yield task.update(value);
                let result = yield task.save();
                console.log(result);
                return result;
            }
            catch (error) {
                logger_1.default.error({ updateMultiTaskDBError: error });
            }
        });
    }
    static getTasksDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getTasks(data);
        });
    }
    static getTasksByIdsDB(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getTasksByIds(ids);
        });
    }
    static __getTasksByIds(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield task_1.default.find({ _id: { $in: ids } }).lean();
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ updateTaskDBError: error });
            }
        });
    }
    /**
     * Delete Tasks where condition
     *
     * it must only used in deleting a department, so the board will also be deleted and all cards and lists inside.
     * If it's used for any other purpose will cause a big issue in which cards are still not deleted.
     * @param data BoardId
     * @returns deleteResult
     */
    static __deleteTasksWhereDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield task_1.default.deleteMany(data);
                if (result)
                    return result;
                throw "Tasks not found";
            }
            catch (error) {
                logger_1.default.error({ deleteTasksWhereError: error });
            }
        });
    }
    static __getTasks(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasks = yield task_1.default.find(data).lean();
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ updateTaskDBError: error });
            }
        });
    }
    static __deleteTasksByProjectId(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteResult = yield task_1.default.deleteMany({ projectId: id });
                return deleteResult;
            }
            catch (error) {
                logger_1.default.error({ deleteTasksByProject: error });
            }
        });
    }
    static __deleteTasks(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let deleteResult = yield task_1.default.deleteMany({ _id: { $in: ids } });
                if (deleteResult) {
                    let remaind = yield task_1.default.find({});
                    return remaind;
                }
                else
                    throw "Error while deleting tasks";
            }
            catch (error) {
                logger_1.default.error({ deleteTasksError: error });
            }
        });
    }
    static __deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findByIdAndDelete(id);
                return task;
            }
            catch (error) {
                logger_1.default.error({ deleteTaskDBError: error });
            }
        });
    }
    static __updateTask(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data.id;
                delete data.id;
                let task = yield task_1.default.findByIdAndUpdate({ _id: id }, Object.assign({}, data), { new: true, lean: true });
                return task;
            }
            catch (error) {
                logger_1.default.error({ updateTaskDBError: error });
            }
        });
    }
    static __createTask(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = new task_1.default(data);
                task = yield task.save();
                yield Department_1.default.findOneAndUpdate({ boardId: data.boardId }, {
                    $push: {
                        tasks: task._id,
                    },
                });
                return task;
            }
            catch (error) {
                logger_1.default.error({ createTaskDBError: error });
            }
        });
    }
    static __filterTasksDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let filter = {};
                if (data.projectId)
                    filter.projectId = data.projectId;
                if (data.memberId)
                    filter.memberId = data.memberId;
                if (data.status)
                    filter.status = data.status;
                if (data.name)
                    filter.name = { $regex: data.name };
                if (data.projectManager)
                    filter.projectManager = { $regex: data.projectManager };
                let tasks = yield task_1.default.find(filter);
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ filterTasksError: error });
            }
        });
    }
}
exports.default = TaskDB;
