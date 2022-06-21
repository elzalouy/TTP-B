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
const Tasks_1 = require("../../types/controller/Tasks");
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
    static updateTaskStatus(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__updateTaskStatus(data, value);
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
    static getOneTaskBy(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getOneTaskBy(data);
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
    static updateTaskByTrelloDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__updateTaskByTrelloDB(data);
        });
    }
    static deleteTaskByTrelloDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__deleteTaskByTrelloDB(data);
        });
    }
    static archiveTaskByTrelloDB(data, archive) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__archiveTaskByTrelloDB(data, archive);
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
    static __updateTaskStatus(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findOne(data);
                task.lastMove = task.status;
                task.lastMoveDate = new Date().toUTCString();
                yield task.updateOne(value);
                let result = yield task.save();
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
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let id = data.id;
                delete data.id;
                console.log("task data", data);
                let task = yield task_1.default.findOne({ _id: id });
                if (!task)
                    return Tasks_1.taskNotFoundError;
                if (((_a = data === null || data === void 0 ? void 0 : data.attachedFiles) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                    data.attachedFiles =
                        ((_b = task === null || task === void 0 ? void 0 : task.attachedFiles) === null || _b === void 0 ? void 0 : _b.length) > 0
                            ? [...task.attachedFiles, ...data.attachedFiles]
                            : [...data.attachedFiles];
                }
                else
                    data.attachedFiles = task.attachedFiles;
                if ((data === null || data === void 0 ? void 0 : data.deleteFiles) && [...data === null || data === void 0 ? void 0 : data.deleteFiles].length > 0) {
                    data.attachedFiles = data.attachedFiles.filter((item) => [...data.deleteFiles].findIndex((file) => file.trelloId === item.trelloId) < 0);
                }
                data === null || data === void 0 ? true : delete data.deleteFiles;
                let update = yield task_1.default.findByIdAndUpdate(id, data, {
                    lean: true,
                    new: true,
                });
                return { error: null, task: update };
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
    static __getOneTaskBy(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findOne(data).lean();
                if (task)
                    return task;
                else
                    return null;
            }
            catch (error) {
                logger_1.default.error({ getOneTaskError: error });
            }
        });
    }
    static __updateTaskByTrelloDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let attachments = (data === null || data === void 0 ? void 0 : data.attachedFiles) ? data.attachedFiles : [];
                delete data.attachedFiles;
                let task = yield task_1.default.findOneAndUpdate({ cardId: data.cardId }, { $set: data, $push: { attachedFiles: attachments } }, {
                    new: true,
                    lean: true,
                });
                return task;
            }
            catch (error) {
                logger_1.default.error({ __updateTaskByTrelloDBError: error });
            }
        });
    }
    static __createTaskByTrelloDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield task_1.default.findOne({ cardId: data.cardId });
                if (result)
                    return result;
                else {
                    let task = new task_1.default(data);
                    return yield task.save();
                }
            }
            catch (error) {
                logger_1.default.error({ __createTaskByTrelloDBError: error });
            }
        });
    }
    static __deleteTaskByTrelloDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let result = yield task_1.default.findOneAndDelete({ cardId: data.cardId });
                return result;
            }
            catch (error) {
                logger_1.default.error({ __deleteTaskByTrelloDBError: error });
            }
        });
    }
    static __archiveTaskByTrelloDB(data, archive) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let taskData = archive === true ? { listId: null, status: "Archived" } : data;
                console.log(taskData);
                let archiveTask = yield task_1.default.findOneAndUpdate({ cardId: data.cardId }, taskData, { new: true, lean: true });
                return archiveTask;
            }
            catch (error) {
                logger_1.default.error({ __archiveTaskByTrelloDBError: error });
            }
        });
    }
}
exports.default = TaskDB;
