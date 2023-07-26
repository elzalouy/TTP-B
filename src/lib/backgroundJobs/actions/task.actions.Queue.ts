import Queue from "queue";
import logger from "../../../logger";
import TrelloController from "../../controllers/trello";
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
import Department from "../../models/Department";
import { IDepartmentState } from "../../types/model/Department";

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
  department: IDepartmentState,
  user: any,
  deadline?: string
) {
  var task;
  updateTaskQueue.push(async (cb) => {
    try {
      let currentTask = await TaskController.getOneTaskBy({ cardId: cardId });
      if (currentTask) {
        let teamList = department.teams.find((item) => item.listId === listId);
        let statusList = department.lists.find(
          (item) => item.listId === listId
        );
        const result = await TrelloController.moveTaskToDiffList(
          cardId,
          teamList?.listId ?? statusList?.listId,
          deadline ?? undefined
        );
        cb(null);
      }
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
  newFiles: Express.Multer.File[],
  tokenUser: any
) => {
  const deleteFiles: AttachmentSchema[] = data.deleteFiles
    ? data.deleteFiles
    : [];
  delete data.deleteFiles;
  delete data.attachedFiles;
  updateTaskQueue.push(async (cb) => {
    try {
      let current = await TaskController.__getTask(data.id);
      let dep = await Department.findOne({ boardId: data.boardId });
      let teamListId = dep.teams.find((item) => item.listId === data.listId);
      let statusListId = dep.lists.find((item) => item.listId === data.listId);
      let taskData: any = {
        name: data.name,
        idBoard: data.boardId,
        idList: teamListId?.listId ?? statusListId?.listId ?? current.listId,
        due: data?.deadline ?? current?.deadline ?? null,
        start: data?.start ?? current?.start ?? null,
        desc: data?.description ?? "",
      };
      let response = await TrelloController.__updateCard({
        cardId: data.cardId,
        data: taskData,
      });
      cb(null, response);
    } catch (error: any) {
      cb(error, null);
      logger.ercror({ updateCardDataError: error });
    }
  });

  updateTaskQueue.push(async (cb) => {
    try {
      if (deleteFiles) {
        if (deleteFiles.length > 0) {
          let isDeletedAll = await deleteFiles?.map(async (item) => {
            return await TrelloController.__deleteAtachment(
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
    let task = await TaskController.updateTaskDB(data, tokenUser);
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
      await TrelloController.removeWebhook(data.cardId);
    } catch (error) {
      logger.ercror({ deleteCardWebhookError: error });
    }
  });
};

export const updateTaskAttachmentsJob = (task: TaskData) => {
  updateTaskQueue.push(async (cb) => {
    try {
      let attachments: AttachmentResponse[] =
        await TrelloController.__getCardAttachments(task.cardId);
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
