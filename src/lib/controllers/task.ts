import { AttachmentSchema, TaskData } from "./../types/model/tasks";
import logger from "../../logger";
import TaskDB from "../dbCalls/tasks/tasks";
import BoardController from "./trello";
import { deleteAll } from "../services/upload";
import {
  createTaskFromBoardJob,
  deleteTaskFromBoardJob,
  moveTaskJob,
  TaskQueue,
  updateCardJob,
} from "../background/taskQueue";
import {
  deleteFilesError,
  provideCardIdError,
} from "../types/controller/Tasks";
class TaskController extends TaskDB {
  static async getTasks(data: TaskData) {
    return await TaskController.__getTasks(data);
  }
  static async createTask(data: TaskData, files: any) {
    return await TaskController.__CreateNewTask(data, files);
  }
  static async updateTask(data: object, files: any) {
    return await TaskController.__updateTaskData(data, files);
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
  static async createTaskByTrello(data: TaskData) {
    return await TaskController.__createTaskByTrello(data);
  }
  static async updateTaskDataByTrello(data: TaskData) {
    return await TaskController.__updateTaskByTrello(data);
  }
  static async moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    list: string,
    user: any
  ) {
    return await TaskController.__moveTaskOnTrello(
      cardId,
      listId,
      status,
      list,
      user
    );
  }

  static async __moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    list: string,
    user: any
  ) {
    try {
      moveTaskJob(listId, cardId, status, user);
      TaskQueue.start();
      return { data: `Task with cardId ${cardId} has moved to list ${list}` };
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }

  static async __updateTaskData(data: TaskData, files: Express.Multer.File[]) {
    try {
      if (!data.cardId) return provideCardIdError;
      // recieve data
      // call a background job for updating the trello card data.
      updateCardJob(data);
      TaskQueue.start();
      // wait for both update date in db and upload,delete files to trello
      // if there are deleted files, then delete it from the db
      let deleteFiles: AttachmentSchema[];
      if (data?.deleteFiles) {
        deleteFiles = JSON.parse(data?.deleteFiles);
        data.deleteFiles = deleteFiles;
        if (deleteFiles.length > 0) {
          await deleteFiles?.forEach(async (item) => {
            if (!item.trelloId) return deleteFilesError;
            await BoardController.__deleteAtachment(data.cardId, item.trelloId);
          });
        }
      }
      // if there are uploading files, upload it in the controller layer.
      if (files) {
        data = await this.__createTaskAttachment(files, data);
      }
      // update data in the db in dbCalls
      let task = await super.updateTaskDB(data);
      deleteAll();
      return task;
    } catch (error) {
      logger.error({ updateTaskError: error });
    }
  }
  /**
   * createTaskAttachment
   * it should be fired inside of a async background job with the webhook
   * @param files to be uploaded
   * @param data to be changes
   * @returns update task
   */
  static async __createTaskAttachment(
    files: Express.Multer.File[],
    data: TaskData
  ) {
    try {
      if (files && files.length > 0) {
        let newAttachments = await files.map(async (file) => {
          return await BoardController.createAttachmentOnCard(
            data.cardId,
            file
          );
        });
        let attachedFiles = await Promise.all(newAttachments);
        console.log("attached files", attachedFiles);
        data.attachedFiles = [];
        attachedFiles.forEach((item) => {
          data.attachedFiles.push({
            trelloId: item.id,
            name: item.fileName,
            mimeType: item.mimeType,
            url: item.url,
          });
        });
      } else delete data.attachedFiles;
      deleteAll();
      return data;
    } catch (error) {
      logger.error({ createTaskAttachmentError: error });
    }
  }
  static async __CreateNewTask(data: TaskData, files: Express.Multer.File[]) {
    try {
      let createdCard: { id: string } | any =
        await BoardController.createCardInList(data.listId, data.name);
      if (createdCard) {
        data.cardId = createdCard.id;
        if (files.length > 0)
          data = await TaskController.__createTaskAttachment(files, data);
        else data.attachedFiles = [];
      } else throw "Error while creating Card in Trello";
      let task = await super.createTaskDB(data);
      createTaskFromBoardJob(task);
      TaskQueue.start();
      return task;
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
        deleteTaskFromBoardJob(task);
        TaskQueue.start();
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
      return { error: "FileError", status: 400 };
    }
  }
  static async __createTaskByTrello(data: TaskData) {
    try {
      let response = await super.__createTaskByTrelloDB(data);
      return response;
    } catch (error) {
      logger.error({ createTaskByTrelloError: error });
    }
  }
  static async __updateTaskByTrello(data: TaskData) {
    try {
      let task = await super.updateTaskByTrelloDB(data);
      return task;
    } catch (error) {
      logger.error({ updateTaskByTrello: error });
    }
  }
}

export default TaskController;
