import queue from "queue";
import logger from "../../logger";
import BoardController from "../controllers/trello";
import NotificationController from "../controllers/notification";
import ProjectDB from "../dbCalls/project/project";
import TaskDB from "../dbCalls/tasks/tasks";
import { io } from "../../index";
import {
  AttachmentResponse,
  AttachmentSchema,
  TaskData,
  TaskInfo,
} from "../types/model/tasks";
import { webhookUpdateInterface } from "../types/controller/Tasks";
import TaskController from "../controllers/task";
import { deleteAll } from "../services/upload";

export const TaskQueue = queue({
  results: [],
  autostart: true,
  concurrency: 1,
});
export const updateTaskQueue = queue({ results: [], autostart: true });
export function moveTaskJob(
  listId: string,
  cardId: string,
  status: string,
  user: any
) {
  var task;
  TaskQueue.push(async (cb) => {
    try {
      const result = await BoardController.moveTaskToDiffList(cardId, listId);
      cb(null, { message: "move in trello" });
    } catch (error) {
      logger.error({ moveTaskJobError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      if (status === "Shared" || status === "Not Clear") {
        console.log(`move task ${cardId} to ${status}`);
        task = await TaskDB.getOneTaskBy({ cardId: cardId });
        await NotificationController.__MoveTaskNotification(task, status, user);
      }
    } catch (error: any) {
      cb(new Error(error), null);
      logger.ercror({ webHookUpdateMoveTaskJobError: error });
    }
  });
}

export const updateCardJob = (
  data: TaskData,
  newFiles: Express.Multer.File[]
) => {
  const deleteFiles: AttachmentSchema[] = data.deleteFiles
    ? data.deleteFiles
    : [];
  delete data.deleteFiles;
  delete data.attachedFiles;
  TaskQueue.push(async (cb) => {
    try {
      console.log({
        name: data.name,
        desc: data.description,
        idList: data.listId,
        idBoard: data.boardId,
      });
      let response = await BoardController.__updateCard(data.cardId, {
        name: data.name,
        desc: data.description,
        idList: data.listId,
        idBoard: data.boardId,
      });
      cb(null, response);
    } catch (error: any) {
      cb(error, null);
      logger.ercror({ updateCardDataError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      // wait for both update date in db and upload,delete files to trello
      // if there are deleted files, then delete it from the db
      let deleteTaskFiles: AttachmentSchema[];
      if (deleteFiles) {
        if (deleteFiles.length > 0) {
          let isDeletedAll = await deleteFiles?.map(async (item) => {
            return await BoardController.__deleteAtachment(
              data.cardId,
              item.trelloId
            );
          });
          let isDeletedResullt = Promise.resolve(isDeletedAll);
          cb(null, isDeletedResullt);
        }
      }
    } catch (error: any) {
      cb(error, null);
      logger.error({ updateCardDeleteFilesJobError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    if (newFiles) {
      await TaskController.__createTaskAttachment(newFiles, data);
    }
    cb(null, true);
  });
  TaskQueue.push(async (cb) => {
    let task = await TaskController.updateTaskDB(data);
    if (task.error) cb(new Error(task.error.message), null);
    await io.sockets.emit("update-task", task);
    deleteAll();

    cb(null, task);
  });
};

export const createTaskFromBoardJob = (data: TaskInfo) => {
  TaskQueue.push(async (cb) => {
    try {
      io.sockets.emit("create-task", data);
      cb(null, data);
    } catch (error) {
      logger.ercror({ createCardDataError: error });
    }
  });
};
export const deleteTaskFromBoardJob = (data: TaskInfo) => {
  TaskQueue.push(async (cb) => {
    try {
      io.sockets.emit("delete-task", data);
      cb(null, data);
    } catch (error) {
      logger.ercror({ deleteCardDataError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      await BoardController.removeWebhook(data.cardId);
    } catch (error) {
      logger.ercror({ deleteCardWebhookError: error });
    }
  });
};
export const updateTaskAttachmentsJob = (task: TaskData) => {
  TaskQueue.push(async (cb) => {
    try {
      let attachments: AttachmentResponse[] =
        await BoardController.__getCardAttachments(task.cardId);
      let newfiles = attachments.map((item) => {
        let file: AttachmentSchema = {
          trelloId: item.id,
          mimeType: item.mimeType,
          name: item.name,
          url: item.url,
        };
        return file;
      });
      console.log("change task files to,", newfiles);
      let Task = await TaskDB.__updateTaskAttachments(task, newfiles);
      io.sockets.emit("update-task", Task);
    } catch (error) {
      logger.ercror({ updateTaskAttachmentsError: error });
    }
  });
};
