import Queue from "queue";
import logger from "../../../logger";
import BoardController from "../../controllers/trello";
import NotificationController from "../../controllers/notification";
import TaskDB from "../../dbCalls/tasks/tasks";
import { io } from "../../../index";
import {
  AttachmentResponse,
  AttachmentSchema,
  TaskData,
  TaskInfo,
} from "../../types/model/tasks";
import TaskController from "../../controllers/task";
import { deleteAll } from "../../services/upload";

export const createTaskQueue = Queue({
  results: [],
  autostart: true,
  concurrency: 1,
});

export const updateTaskQueue = Queue({
  results: [],
  autostart: true,
  concurrency: 1,
});
export function moveTaskJob(
  listId: string,
  cardId: string,
  status: string,
  user: any
) {
  var task;
  updateTaskQueue.push(async (cb) => {
    try {
      const result = await BoardController.moveTaskToDiffList(cardId, listId);
      cb(null);
    } catch (error) {
      logger.error({ moveTaskJobError: error });
    }
  });
  updateTaskQueue.push(async (cb) => {
    try {
      if (status === "Shared" || status === "Not Clear") {
        task = await TaskDB.getOneTaskBy({ cardId: cardId });
        await NotificationController.__MoveTaskNotification(task, status, user);
      }
      cb(null);
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
  updateTaskQueue.push(async (cb) => {
    try {
      let taskData: any = {
        name: data.name,
        boardId: data.boardId,
        listId: data.listId,
        due: data.deadline ? data.deadline : "",
        desc: data.description ? data.description : "",
      };
      let response = await BoardController.__updateCard(data.cardId, taskData);
      cb(null, response);
    } catch (error: any) {
      cb(error, null);
      logger.ercror({ updateCardDataError: error });
    }
  });

  updateTaskQueue.push(async (cb) => {
    try {
      // wait for both update data in db and upload,delete files to trello
      // if there are deleted files, then delete it from the db
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

  updateTaskQueue.push(async (cb) => {
    if (newFiles) {
      await TaskController.__createTaskAttachment(newFiles, data);
    }
    cb(null, true);
  });

  updateTaskQueue.push(async (cb) => {
    let task = await TaskController.updateTaskDB(data);
    if (task.error) cb(new Error(task.error.message), null);
    await io.sockets.emit("update-task", task.task);
    deleteAll();
    cb(null, task);
  });
};

export const deleteTaskFromBoardJob = (data: TaskInfo) => {
  updateTaskQueue.push(async (cb) => {
    try {
      io.sockets.emit("delete-task", data);
      cb(null, data);
    } catch (error) {
      logger.ercror({ deleteCardDataError: error });
    }
  });
  updateTaskQueue.push(async (cb) => {
    try {
      await BoardController.removeWebhook(data.cardId);
    } catch (error) {
      logger.ercror({ deleteCardWebhookError: error });
    }
  });
};

export const updateTaskAttachmentsJob = (task: TaskData) => {
  updateTaskQueue.push(async (cb) => {
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
      let Task = await TaskDB.__updateTaskAttachments(task, newfiles);
      io.sockets.emit("update-task", Task);
    } catch (error) {
      logger.ercror({ updateTaskAttachmentsError: error });
    }
  });
};
