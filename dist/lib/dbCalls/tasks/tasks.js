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
const project_1 = __importDefault(require("../project/project"));
const TaskDB = class TaskDB {
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
    static updateOneTaskDB(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__updateOneTaskDB(data, value);
        });
    }
    static __updateOneTaskDB(data, value) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.updateOne(Object.assign({}, data), { value }, { new: true, lean: true });
                return task;
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
    static __deleteTask(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let task = yield task_1.default.findByIdAndDelete({ _id: id });
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
                let projectId = task.projectId.toString();
                let tasks = yield (yield task_1.default.find({ projectId: projectId })).length;
                yield project_1.default.updateProjectDB({
                    _id: projectId,
                    numberOfTasks: tasks,
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
                console.log(data);
                let tasks = yield task_1.default.find(filter);
                console.log(tasks);
                return tasks;
            }
            catch (error) {
                logger_1.default.error({ filterTasksError: error });
            }
        });
    }
};
exports.default = TaskDB;
