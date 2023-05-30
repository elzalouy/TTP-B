"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../../../logger"));
const Task_1 = __importStar(require("../../models/Task"));
const lodash_1 = __importDefault(require("lodash"));
const mongoose_1 = __importDefault(require("mongoose"));
const Tasks_1 = require("../../types/controller/Tasks");
const mongodb_1 = require("mongodb");
const __1 = require("../../..");
class TaskDB {
  static createTaskDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield TaskDB.__createTask(data);
    });
  }
  static updateTaskDB(data, user) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield TaskDB.__updateTask(data, user);
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
  static updateTaskByTrelloDB(data, user) {
    return __awaiter(this, void 0, void 0, function* () {
      return yield TaskDB.__updateTaskByTrelloDB(data, user);
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
        let tasks = Task_1.default.find(data);
        return tasks;
      } catch (error) {
        logger_1.default.error({ getAllTasksDBError: error });
      }
    });
  }
  static __getTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOne({ _id: id });
        return task;
      } catch (error) {
        logger_1.default.error({ getTaskDBError: error });
      }
    });
  }
  static __getTaskDepartment(depId) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let taskCount = yield Task_1.default.aggregate([
          {
            $facet: {
              inProgressTasks: [
                {
                  $match: {
                    marchentID: new mongoose_1.default.Types.ObjectId(depId),
                    status: {
                      $in: ["In Progress", "shared", "not clear", "review"],
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
      } catch (error) {
        logger_1.default.error({ getTaskDepartmentDBError: error });
      }
    });
  }
  static __updateTaskStatus(data, value) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOne(data);
        let newdata = Object.assign({}, value);
        let result = yield Task_1.default.findOneAndUpdate(data, newdata, {
          new: true,
          lean: true,
        });
        return result;
      } catch (error) {
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
        let tasks = yield Task_1.default.find({ _id: { $in: ids } }).lean();
        return tasks;
      } catch (error) {
        logger_1.default.error({ getTasksByIdDBError: error });
      }
    });
  }
  static __deleteTasksWhereDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let tasks = yield Task_1.default.find(data);
        let result = yield Task_1.default.deleteMany(data);
        if (result) return tasks;
        throw "Tasks not found";
      } catch (error) {
        logger_1.default.error({ deleteTasksWhereError: error });
      }
    });
  }
  static __getTasks(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let tasks = yield Task_1.default.find(data).lean();
        return tasks;
      } catch (error) {
        logger_1.default.error({ getTaskDBError: error });
      }
    });
  }
  static __deleteTasksByProjectId(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let deleteResult = yield Task_1.default.deleteMany({ projectId: id });
        return deleteResult;
      } catch (error) {
        logger_1.default.error({ deleteTasksByProject: error });
      }
    });
  }
  static __deleteTasks(ids) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let deleteResult = yield Task_1.default.deleteMany({
          _id: { $in: ids },
        });
        if (deleteResult) {
          let remaind = yield Task_1.default.find({});
          return remaind;
        } else throw "Error while deleting tasks";
      } catch (error) {
        logger_1.default.error({ deleteTasksError: error });
      }
    });
  }
  static __deleteTask(id) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findByIdAndDelete(id);
        return task;
      } catch (error) {
        logger_1.default.error({ deleteTaskDBError: error });
      }
    });
  }
  static __updateTask(data, user) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let id = data.id;
        delete data.id;
        let task = yield Task_1.default.findOne({ _id: id });
        if (!task) return Tasks_1.taskNotFoundError;
        // Update the task deadlineChain
        if (
          task.deadline &&
          data.deadline &&
          new Date(task.deadline).toString() !==
            new Date(data.deadline).toString()
        ) {
          task.deadlineChain.push({
            userId: user.id,
            name: user.name,
            before: new Date(task.deadline),
            current: new Date(data.deadline),
          });
        }
        task.name = data.name;
        task.description =
          (_a = data.description) !== null && _a !== void 0 ? _a : "";
        task.deadline =
          (_b = data.deadline) !== null && _b !== void 0 ? _b : null;
        task.categoryId =
          (_c = new mongoose_1.default.Types.ObjectId(
            data === null || data === void 0 ? void 0 : data.categoryId
          )) !== null && _c !== void 0
            ? _c
            : task.categoryId;
        task.subCategoryId =
          (_d = new mongoose_1.default.Types.ObjectId(
            data === null || data === void 0 ? void 0 : data.subCategoryId
          )) !== null && _d !== void 0
            ? _d
            : task.subCategoryId;
        task.status =
          (_e = data.status) !== null && _e !== void 0 ? _e : task.status;
        task.cardId =
          (_f = data.cardId) !== null && _f !== void 0 ? _f : task.cardId;
        task.boardId =
          (_g = data.boardId) !== null && _g !== void 0 ? _g : task.boardId;
        task.listId =
          (_h = data.listId) !== null && _h !== void 0 ? _h : task.listId;
        task.attachedFiles = data.deleteFiles
          ? task.attachedFiles.filter(
              (item) => item.trelloId === data.deleteFiles.trelloId
            )
          : task.attachedFiles;
        task.teamId =
          (_j = new mongodb_1.ObjectId(data.teamId)) !== null && _j !== void 0
            ? _j
            : task.teamId;
        task.movements = [
          ...task.movements,
          data.status !== task.status && {
            status: data.status,
            movedAt: new Date(Date.now()),
          },
        ];
        console.log({ task });
        delete task._id;
        let update = yield Task_1.default.findByIdAndUpdate(id, task, {
          new: true,
          lean: true,
          upsert: true,
        });
        return { error: null, task: update };
      } catch (error) {
        logger_1.default.error({ updateTaskDBError: error });
      }
    });
  }
  static __updateTasksProjectId(projectId, ids) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let updateResult = yield Task_1.default.updateMany(
          { _id: { $in: ids } },
          { projectId: projectId }
        );
        return updateResult;
      } catch (error) {
        logger_1.default.error({ updateTasksProjectIdError: error });
      }
    });
  }
  static __updateTaskAttachments(data, attachments) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOneAndUpdate(
          data,
          {
            $set: { attachedFiles: attachments },
          },
          { new: true, lean: true }
        );
        return task;
      } catch (error) {
        logger_1.default.error({ updateAttachmentsDBError: error });
      }
    });
  }
  static __createTask(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = new Task_1.default(data);
        task = yield task.save();
        return task;
      } catch (error) {
        logger_1.default.error({ createTaskDBError: error });
      }
    });
  }
  static __filterTasksDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let filter = {};
        if (data.projectId) filter.projectId = data.projectId;
        if (data.memberId) filter.memberId = data.memberId;
        if (data.status) filter.status = data.status;
        if (data.name) {
          let name = data.name.toLowerCase();
          filter.name = { $regex: new RegExp("^" + name, "i") };
        }
        if (data.projectManager)
          filter.projectManager = { $regex: data.projectManager };
        let tasks = yield Task_1.default.find(filter);
        return tasks;
      } catch (error) {
        logger_1.default.error({ filterTasksError: error });
      }
    });
  }
  static __getOneTaskBy(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOne(data).lean();
        if (task) return task;
        else return null;
      } catch (error) {
        logger_1.default.error({ getOneTaskError: error });
      }
    });
  }
  static __updateTaskByTrelloDB(data, user) {
    var _a, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOne({ cardId: data.cardId });
        if (
          (task === null || task === void 0 ? void 0 : task.deadline) !==
            null &&
          task.deadline !== undefined &&
          (data === null || data === void 0 ? void 0 : data.deadline) &&
          new Date(task.deadline).toString() !==
            new Date(data.deadline).toString()
        ) {
          task.deadlineChain.push({
            userId: user.id,
            name: user.name,
            before: new Date(task.deadline),
            current: new Date(data.deadline),
          });
        }
        task.name = (data === null || data === void 0 ? void 0 : data.name)
          ? data === null || data === void 0
            ? void 0
            : data.name
          : task.name;
        task.status = (data === null || data === void 0 ? void 0 : data.status)
          ? data.status
          : task.status;
        task.listId = (data === null || data === void 0 ? void 0 : data.listId)
          ? data.listId
          : task.listId;
        task.cardId = (data === null || data === void 0 ? void 0 : data.cardId)
          ? data.cardId
          : task.cardId;
        task.boardId = (
          data === null || data === void 0 ? void 0 : data.boardId
        )
          ? data.boardId
          : task.boardId;
        task.description = data.description;
        task.deadlineChain = task.deadlineChain;
        task.teamId =
          (data === null || data === void 0 ? void 0 : data.teamId) === null ||
          ((_a = data === null || data === void 0 ? void 0 : data.teamId) ===
            null || _a === void 0
            ? void 0
            : _a.toString().length) > 0
            ? new mongodb_1.ObjectId(data.teamId)
            : task.teamId;
        task.deadline = data.deadline;
        task.start = data.start ? data.start : null;
        if (data.attachedFile) {
          let file = new Task_1.TaskFileSchema(
            Object.assign({}, data.attachedFile)
          );
          task.attachedFiles.push(file);
        }
        if (
          data.deleteFiles &&
          ((_b =
            data === null || data === void 0 ? void 0 : data.deleteFiles) ===
            null || _b === void 0
            ? void 0
            : _b.trelloId)
        ) {
          task.attachedFiles = lodash_1.default.filter(
            task.attachedFiles,
            (item) => {
              var _a;
              return (
                item.trelloId !==
                ((_a =
                  data === null || data === void 0
                    ? void 0
                    : data.deleteFiles) === null || _a === void 0
                  ? void 0
                  : _a.trelloId)
              );
            }
          );
        }
        task.movements =
          (_c = data.movements) !== null && _c !== void 0 ? _c : task.movements;
        task.attachedFiles = lodash_1.default.uniqBy(
          task.attachedFiles,
          "trelloId"
        );
        let result = yield (yield task.save()).toObject();
        yield __1.io.sockets.emit("update-task", result);
      } catch (error) {
        logger_1.default.error({ __updateTaskByTrelloDBError: error });
      }
    });
  }
  static __createTaskByTrelloDB(data) {
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let task = yield Task_1.default.findOne({ cardId: data.cardId });
        if (task) {
          task = yield task.set(data).save();
          yield __1.io.sockets.emit("update-task", task);
          return task;
        } else {
          let task = new Task_1.default(data);
          task.movements = [
            { status: data.status, movedAt: new Date(Date.now()) },
          ];
          task = yield task.save();
          yield __1.io.sockets.emit("create-task", task);
          return yield task;
        }
      } catch (error) {
        logger_1.default.error({ __createTaskByTrelloDBError: error });
      }
    });
  }
  static __deleteTaskByTrelloDB(data) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let result = yield Task_1.default.findOneAndDelete({
          cardId: data.cardId,
        });
        return (_a =
          __1.io === null || __1.io === void 0 ? void 0 : __1.io.sockets) ===
          null || _a === void 0
          ? void 0
          : _a.emit("delete-task", result);
      } catch (error) {
        logger_1.default.error({ __deleteTaskByTrelloDBError: error });
      }
    });
  }
  static __archiveTaskByTrelloDB(data, archive) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      try {
        let taskData =
          archive === true ? { listId: null, status: "Archived" } : data;
        let archiveTask = yield Task_1.default.findOneAndUpdate(
          { cardId: data.cardId },
          taskData,
          { new: true, lean: true }
        );
        return (_a =
          __1.io === null || __1.io === void 0 ? void 0 : __1.io.sockets) ===
          null || _a === void 0
          ? void 0
          : _a.emit("update-task", archiveTask);
      } catch (error) {
        logger_1.default.error({ __archiveTaskByTrelloDBError: error });
      }
    });
  }
}
exports.default = TaskDB;
