"use strict";
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
exports.updateTaskAttachmentsJob =
  exports.deleteTaskFromBoardJob =
  exports.createTaskFromBoardJob =
  exports.updateCardJob =
  exports.moveTaskJob =
  exports.updateTaskQueue =
  exports.TaskQueue =
    void 0;
const queue_1 = __importDefault(require("queue"));
const logger_1 = __importDefault(require("../../logger"));
const trello_1 = __importDefault(require("../controllers/trello"));
const notification_1 = __importDefault(require("../controllers/notification"));
const tasks_1 = __importDefault(require("../dbCalls/tasks/tasks"));
const index_1 = require("../../logger");
const task_1 = __importDefault(require("../controllers/task"));
const upload_1 = require("../services/upload");
exports.TaskQueue = (0, queue_1.default)({
  results: [],
  autostart: true,
  concurrency: 1,
});
exports.updateTaskQueue = (0, queue_1.default)({
  results: [],
  autostart: true,
});
function moveTaskJob(listId, cardId, status, user) {
  var task;
  exports.TaskQueue.push((cb) =>
    __awaiter(this, void 0, void 0, function* () {
      try {
        const result = yield trello_1.default.moveTaskToDiffList(
          cardId,
          listId
        );
        cb(null, { message: "move in trello" });
      } catch (error) {
        logger_1.default.error({ moveTaskJobError: error });
      }
    })
  );
  exports.TaskQueue.push((cb) =>
    __awaiter(this, void 0, void 0, function* () {
      try {
        if (status === "Shared" || status === "Not Clear") {
          console.log(`move task ${cardId} to ${status}`);
          task = yield tasks_1.default.getOneTaskBy({ cardId: cardId });
          yield notification_1.default.__MoveTaskNotification(
            task,
            status,
            user
          );
        }
      } catch (error) {
        cb(new Error(error), null);
        logger_1.default.ercror({ webHookUpdateMoveTaskJobError: error });
      }
    })
  );
}
exports.moveTaskJob = moveTaskJob;
const updateCardJob = (data, newFiles) => {
  const deleteFiles = data.deleteFiles ? data.deleteFiles : [];
  delete data.deleteFiles;
  delete data.attachedFiles;
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        console.log(data);
        let taskData = {
          name: data.name,
          idList: data.listId,
          idBoard: data.boardId,
        };
        if (data.description) taskData.desc = data.description;
        if (data.deadline)
          taskData.deadline = new Date(data.deadline).toString();
        console.log({ taskData });
        let response = yield trello_1.default.__updateCard(
          data.cardId,
          taskData
        );
        cb(null, response);
      } catch (error) {
        cb(error, null);
        logger_1.default.ercror({ updateCardDataError: error });
      }
    })
  );
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        // wait for both update date in db and upload,delete files to trello
        // if there are deleted files, then delete it from the db
        if (deleteFiles) {
          if (deleteFiles.length > 0) {
            let isDeletedAll = yield deleteFiles === null ||
            deleteFiles === void 0
              ? void 0
              : deleteFiles.map((item) =>
                  __awaiter(void 0, void 0, void 0, function* () {
                    return yield trello_1.default.__deleteAtachment(
                      data.cardId,
                      item.trelloId
                    );
                  })
                );
            let isDeletedResullt = Promise.resolve(isDeletedAll);
            cb(null, isDeletedResullt);
          }
        }
      } catch (error) {
        cb(error, null);
        logger_1.default.error({ updateCardDeleteFilesJobError: error });
      }
    })
  );
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      if (newFiles) {
        yield task_1.default.__createTaskAttachment(newFiles, data);
      }
      cb(null, true);
    })
  );
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      let task = yield task_1.default.updateTaskDB(data);
      if (task.error) cb(new Error(task.error.message), null);
      yield index_1.io.sockets.emit("update-task", task.task);
      (0, upload_1.deleteAll)();
      cb(null, task);
    })
  );
};
exports.updateCardJob = updateCardJob;
const createTaskFromBoardJob = (data) => {
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        index_1.io.sockets.emit("create-task", data);
        cb(null, data);
      } catch (error) {
        logger_1.default.ercror({ createCardDataError: error });
      }
    })
  );
};
exports.createTaskFromBoardJob = createTaskFromBoardJob;
const deleteTaskFromBoardJob = (data) => {
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        index_1.io.sockets.emit("delete-task", data);
        cb(null, data);
      } catch (error) {
        logger_1.default.ercror({ deleteCardDataError: error });
      }
    })
  );
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        yield trello_1.default.removeWebhook(data.cardId);
      } catch (error) {
        logger_1.default.ercror({ deleteCardWebhookError: error });
      }
    })
  );
};
exports.deleteTaskFromBoardJob = deleteTaskFromBoardJob;
const updateTaskAttachmentsJob = (task) => {
  exports.TaskQueue.push((cb) =>
    __awaiter(void 0, void 0, void 0, function* () {
      try {
        let attachments = yield trello_1.default.__getCardAttachments(
          task.cardId
        );
        let newfiles = attachments.map((item) => {
          let file = {
            trelloId: item.id,
            mimeType: item.mimeType,
            name: item.name,
            url: item.url,
          };
          return file;
        });
        let Task = yield tasks_1.default.__updateTaskAttachments(
          task,
          newfiles
        );
        index_1.io.sockets.emit("update-task", Task);
      } catch (error) {
        logger_1.default.ercror({ updateTaskAttachmentsError: error });
      }
    })
  );
};
exports.updateTaskAttachmentsJob = updateTaskAttachmentsJob;
