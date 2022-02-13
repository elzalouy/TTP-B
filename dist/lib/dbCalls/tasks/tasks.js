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
    static getTaskDB(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield TaskDB.__getTask(data);
        });
    }
    static __getTask(data) {
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
                yield task.save();
                return task;
            }
            catch (error) {
                logger_1.default.error({ createTaskDBError: error });
            }
        });
    }
};
exports.default = TaskDB;
