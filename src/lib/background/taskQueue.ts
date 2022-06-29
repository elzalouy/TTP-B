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

export const TaskQueue = queue({ results: [] });
export const updateTaskQueue = queue({ results: [] });
export function moveTaskJob(listId: string, cardId: string, status: string) {
  var task: TaskInfo;
  TaskQueue.push(async (cb) => {
    try {
      TaskQueue.start();
      const result = await BoardController.moveTaskToDiffList(cardId, listId);
      cb(null, { message: "move in trello" });
    } catch (error) {
      logger.error({ moveTaskJobError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      task = await TaskDB.updateTaskStatus(
        {
          cardId: cardId,
        },
        {
          status: status,
          listId: listId,
        }
      );
      io.sockets.emit("update-task", task);
      cb(null, task);
    } catch (error: any) {
      cb(new Error(error), null);
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      // if task status update to shared send notification
      if (status === "Shared" || status === "Not Clear") {
        console.log("action_move_card_from_list_to_list: Shared");
        let targetTask = task;
        let projectData = await ProjectDB.__getProject({
          _id: targetTask.projectId,
        });
        let cardName: string = targetTask.name;
        let createNotifi = await NotificationController.createNotification({
          title: `${cardName} status has been changed to ${status}`,
          description: `${cardName} status has been changed to ${status}`,
          projectManagerID: projectData.projectManager,
          projectID: targetTask.projectId,
          adminUserID: projectData.adminId,
        });
        console.log("notifiaction move task to shared");
        io.to("admin-room").emit("notification-update", createNotifi);
        io.to(`user-${projectData.projectManager}`).emit(
          "notification-update",
          createNotifi
        );
      }
    } catch (error: any) {
      cb(new Error(error), null);
      logger.ercror({ webHookUpdateMoveTaskJobError: error });
    }
  });
}

export const moveTaskNotificationJob = (data: webhookUpdateInterface) => {
  TaskQueue.push(async (cb) => {
    try {
      let to = data.action.data?.listAfter?.name;
      // if task status update to shared send notification
      if (
        data.action.display.translationKey ===
        "action_move_card_from_list_to_list"
      ) {
        let targetTask = await TaskDB.getOneTaskBy({
          cardId: data.action.data.card.id,
        });
        let projectData = await ProjectDB.__getProject({
          _id: targetTask.projectId,
        });
        let userName: string =
          data?.action?.display?.entities?.memberCreator?.username;
        let cardName: string = data?.action?.data.card.name;
        if (to === "Shared" || to === "Not Clear") {
          let createNotifi = await NotificationController.createNotification({
            title: `${cardName} status has been changed to ${to}`,
            description: `${cardName} status has been changed to ${to} by ${userName}`,
            projectManagerID: projectData.projectManager,
            projectID: targetTask.projectId,
            adminUserID: projectData.adminId,
          });
          // send notification to all the admin
          io.to("admin-room").emit("notification-update", createNotifi);
          // send notification to specific project manager
          io.to(`user-${projectData.projectManager}`).emit(
            "notification-update",
            createNotifi
          );
        }
      }
    } catch (error: any) {
      cb(new Error(error), null);
      logger.ercror({ webHookUpdateMoveTaskJobError: error });
    }
  });
};

export const updateCardJob = (data: TaskData) => {
  TaskQueue.push(async (cb) => {
    try {
      let response = await BoardController.__updateCard(data.cardId, {
        name: data.name,
        desc: data?.description ? data?.description : "",
      });
      cb(null, response);
    } catch (error: any) {
      cb(error, null);
      logger.ercror({ updateCardDataError: error });
    }
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
