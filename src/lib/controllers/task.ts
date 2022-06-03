import {
  AttachmentResponse,
  AttachmentSchema,
  TaskData,
  TaskInfo,
} from "./../types/model/tasks";
import { customeError } from "./../utils/errorUtils";
import logger from "../../logger";
import TaskDB from "../dbCalls/tasks/tasks";
import BoardController from "./boards";
import Project from "../models/Project";
import NotificationController from "./notification";
import { io } from "../server";
import ProjectDB from "../dbCalls/project/project";
import { deleteAll } from "../services/upload";
import { Express } from "express";

class TaskController extends TaskDB {
  static async getTasks(data: TaskData) {
    return await TaskController.__getTasks(data);
  }
  static async createTask(data: TaskData, files: any) {
    return await TaskController.__CreateNewTask(data, files);
  }
  static async updateTask(data: object) {
    return await TaskController.__updateTaskData(data);
  }
  static async webhookUpdate(data: object) {
    return await TaskController.__webhookUpdate(data);
  }
  static async filterTasks(data: any) {
    return await TaskController.__filterTasksDB(data);
  }
  static async deleteTask(id: string) {
    return await TaskController.__deleteTask(id);
  }
  static async deleteTasksByProjectId(id: string) {
    return await TaskController.__deleteTasksByProjectId(id);
  }
  static async deleteTasks(ids: string[]) {
    return await TaskController.__deleteTasks(ids);
  }
  static async deleteTasksWhere(data: TaskData) {
    return await TaskController.__deleteTasksWhere(data);
  }
  static async downloadAttachment(cardId: string, attachmentId: string) {
    return await TaskController.__downloadAttachment(cardId, attachmentId);
  }
  static async moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string
  ) {
    return await TaskController.__moveTaskOnTrello(cardId, listId, status);
  }

  static async __moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string
  ) {
    try {
      await BoardController.moveTaskToDiffList(cardId, listId);
      let task = await TaskDB.updateOneTaskDB(
        {
          cardId: cardId,
        },
        {
          status: status,
        }
      );
      return task;
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }
  static async __webhookUpdate(data: any) {
    try {
      console.log(data);
      let targetTask: any;
      const targetList: any = [
        "Not Started",
        "Done",
        "Shared",
        "Review",
        "Not Clear",
        "Cancled",
      ];
      logger.info({
        afterList: data?.action?.display?.entities?.listAfter?.text,
      });
      if (
        targetList.includes(data?.action?.display?.entities?.listAfter?.text)
      ) {
        targetTask = await TaskDB.updateOneTaskDB(
          {
            cardId: data.action.display.entities.card.id,
          },
          {
            status: data?.action?.display?.entities?.listAfter?.text,
          }
        );
        // if task status update to shared send notification
        if (data?.action?.display?.entities?.listAfter?.text === "Shared") {
          let projectData: any = await ProjectDB.getProjectDB({
            _id: targetTask.projectId,
          });
          let userName: string =
            data?.action?.display?.entities?.memberCreator?.username;
          let cardName: string = data?.action?.display?.entities?.card?.text;

          let createNotifi = await NotificationController.createNotification({
            title: `${cardName} status has been changed to Shared`,
            description: `${cardName} status has been changed to shared by ${userName}`,
            projectManagerID: projectData.projectManager,
            projectID: targetTask.projectId,
            adminUserID: projectData.adminId,
          });

          // send notification to all the admin
          io.to("admin room").emit("notification update", createNotifi);

          // send notification to specific project manager
          io.to(`user-${projectData.projectManager}`).emit(
            "notification update",
            createNotifi
          );
        }
        io.sockets.emit("Move Task", {
          cardId: data.action.display.entities.card.id,
          to: data?.action?.display?.entities?.listAfter?.text,
        });
      } else {
        targetTask = await TaskDB.updateOneTaskDB(
          {
            cardId: data.action.display.entities.card.id,
          },
          {
            status: "inProgress",
          }
        );
        io.sockets.emit("Move Task", {
          cardId: data.action.display.entities.card.id,
          to: "inProgress",
        });
      }
      return targetTask;
    } catch (error) {
      logger.error({ webhookUpdateError: error });
    }
  }
  static async __updateTaskData(data: any) {
    try {
      if (data.idModel) {
        logger.info({ webhookCall: data });
      } else {
        let task = await super.updateTaskDB(data);
        return task;
      }
    } catch (error) {
      logger.error({ updateTaskError: error });
    }
  }

  static async __CreateNewTask(data: TaskData, files: Express.Multer.File[]) {
    try {
      let createdCard: { id: string } | any =
        await BoardController.createCardInList(data.listId, data.name);
      if (createdCard) {
        data.cardId = createdCard.id;
        let attachment: AttachmentResponse;
        let newAttachments: AttachmentSchema[] = [];
        if (files) {
          await Promise.all(
            files.map(async (file) => {
              attachment = await BoardController.createAttachmentOnCard(
                createdCard.id,
                file
              );
              newAttachments.push({
                name: file.filename,
                mimeType: attachment?.mimeType,
                trelloId: attachment.id,
                url: attachment.url,
              });
              data.attachedFiles = newAttachments;
            })
          );
        }
        console.log(data);
        deleteAll();
        return await super.createTaskDB(data);
      } else throw "Error while creating Card in Trello";
    } catch (error) {
      logger.error({ getTeamsError: error });
    }
  }

  static async __getTasks(data: TaskData) {
    try {
      let tasks = await super.getTasksDB(data);
      return tasks;
    } catch (error) {
      logger.error({ getTasksError: error });
    }
  }
  static async __deleteTasksByProjectId(id: string) {
    try {
      let tasks = await super.getTasksDB({
        projectId: id,
      });
      tasks.forEach(async (item) => {
        await BoardController.deleteCard(item.cardId);
      });
      return await super.deleteTasksByProjectIdDB(id);
    } catch (error) {
      logger.error({ DeleteTasksByProjectId: error });
    }
  }
  static async __deleteTasksWhere(data: TaskData) {
    try {
      // let tasks = await super.getTasksByIdsDB;
      let deleteResult = await super.deleteTasksWhereDB(data);
      if (deleteResult) return deleteResult;
      else throw "Error hapenned while deleting tasks";
    } catch (error) {
      logger.error({ DeleteTasksWhereError: error });
    }
  }
  static async __deleteTasks(ids: string[]) {
    try {
      let tasks = await super.getTasksByIdsDB(ids);
      tasks.forEach(async (item) => {
        BoardController.deleteCard(item.cardId);
      });
      return await super.deleteTasksDB(ids);
    } catch (error) {
      logger.error({ DeleteTasksByProjectId: error });
    }
  }
  static async __deleteTask(id: string) {
    try {
      let task = await super.getTaskDB(id);
      if (task) {
        await BoardController.deleteCard(task?.cardId);
        return await super.deleteTaskDB(id);
      }
      throw "Task not existed";
    } catch (error) {
      logger.error({ deleteTaskError: error });
    }
  }
  static async __downloadAttachment(cardId: string, attachmentId: string) {
    try {
      let response = await BoardController.downloadAttachment(
        cardId,
        attachmentId
      );
      return response;
    } catch (error) {
      logger.error({ downloadAttachmentError: error });
    }
  }
}
export default TaskController;
