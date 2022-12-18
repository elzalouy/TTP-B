import { TaskData, TaskInfo } from "./../types/model/tasks";
import logger from "../../logger";
import TaskDB from "../dbCalls/tasks/tasks";
import TrelloController from "./trello";
import {
  deleteTaskFromBoardJob,
  moveTaskJob,
  updateCardJob,
} from "../backgroundJobs/actions/task.actions.Queue";
import { provideCardIdError } from "../types/controller/Tasks";
import { io } from "../..";
import { taskRoutesQueue } from "../backgroundJobs/routes/tasks.Route.Queue";
import {
  IDepartment,
  IDepartmentState,
  ListTypes,
} from "../types/model/Department";
import TrelloActionsController from "./trello";
import { Board, Card } from "../types/controller/trello";
import _ from "lodash";
import Tasks from "../models/Task";
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
    department: IDepartment,
    user: any
  ) {
    return await TaskController.__moveTaskOnTrello(
      cardId,
      listId,
      status,
      list,
      department,
      user
    );
  }

  static async __moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    list: string,
    department: IDepartmentState,
    user: any
  ) {
    try {
      moveTaskJob(listId, cardId, status, department, user);
      return { data: `Task with cardId ${cardId} has moved to list ${list}` };
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }

  static async __updateTaskData(data: TaskData, files: Express.Multer.File[]) {
    try {
      if (!data.cardId) return provideCardIdError;
      updateCardJob(data, files);
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
          return await TrelloController.createAttachmentOnCard(
            data.cardId,
            file
          );
        });
        let attachedFiles = await Promise.all(newAttachments);
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
      return data;
    } catch (error) {
      logger.error({ createTaskAttachmentError: error });
    }
  }

  static async __CreateNewTask(data: TaskData, files: Express.Multer.File[]) {
    try {
      let task: TaskInfo;
      data.attachedFiles = [];
      let createdCard: { id: string } | any =
        await TrelloController.createCardInList(data);
      if (createdCard) {
        data.cardId = createdCard.id;
        data.trelloShortUrl = createdCard.shortUrl;
        task = await super.createTaskDB(data);
        if (task) {
          taskRoutesQueue.push(async () => {
            data.cardId = createdCard.id;
            data.trelloShortUrl = createdCard.shortUrl;
            await TrelloController.createWebHook(
              data.cardId,
              "trelloWebhookUrlTask"
            );
            if (files.length > 0)
              data = await TaskController.__createTaskAttachment(files, data);
          });
        }
      }
      return task;
    } catch (error) {
      logger.error({ createTaskError: error });
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
        if (item.cardId) {
          await TrelloController.deleteCard(item.cardId);
          await TrelloController.removeWebhook(item.cardId);
        }
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
      deleteResult.forEach((item) =>
        TrelloController.removeWebhook(item.cardId)
      );
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
        TrelloController.deleteCard(item.cardId);
        TrelloController.removeWebhook(item.cardId);
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
        await TrelloController.deleteCard(task?.cardId);
        return await super.deleteTaskDB(id);
      }
      throw "Task not existed";
    } catch (error) {
      logger.error({ deleteTaskError: error });
    }
  }

  static async __downloadAttachment(cardId: string, attachmentId: string) {
    try {
      let response = await TrelloController.downloadAttachment(
        cardId,
        attachmentId
      );
      return response;
    } catch (error) {
      logger.error({ downloadAttachmentError: error });
      return { error: "FileError", status: 400 };
    }
  }
  static async __createNotSavedCardsOnBoard(board: IDepartmentState) {
    try {
      let cards: Card[] = await TrelloActionsController.__getCardsInBoard(
        board.boardId
      );
      if (cards) {
        let tasks = await TaskController.getTasks({ boardId: board.boardId });
        if (tasks) {
          cards.map(async (item) => {
            let isTaskFound = tasks.find((task) => task.cardId === item.id);
            let isStatusList = ListTypes.includes(
              board.lists.find((list) => list.listId === item.idList).name
            )
              ? true
              : false;
            let cardList = isStatusList
              ? board.lists.find((list) => list.listId === item.idList)
              : board.teams.find((list) => list.listId === item.idList);
            let task = {
              boardId: item.idBoard,
              cardId: item.id,
              trelloShortUrl: item.shortUrl,
              name: item.name,
              description: item.desc,
              start: item.start,
              deadline: item.due,
              listId: isStatusList
                ? item.idList
                : board.lists.find((item) => item.name === "In Progress")
                    .listId,
              teamId: isStatusList ? null : item.idList,
              status: isStatusList ? cardList.name : "In Progress",
            };
            if (isTaskFound && isTaskFound._id) {
              task = await Tasks.findOneAndUpdate({ cardId: item.id }, task);
              await TrelloActionsController.__addWebHook(
                task.cardId,
                "trelloWebhookUrlTask"
              );
            } else {
              let taskInfo = await new Tasks(task).save();
              await TrelloActionsController.__addWebHook(
                taskInfo.cardId,
                "trelloWebhookUrlTask"
              );
            }
          });
        }
      }
    } catch (error) {
      logger.error({ __createNotSavedCardsOnBoardError: error });
    }
  }

  static async __createTaskByTrello(data: TaskData) {
    try {
      let response = await super.__createTaskByTrelloDB(data);
      if (response?.cardId)
        await TrelloController.createWebHook(
          response.cardId,
          "trelloWebhookUrlTask"
        );
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

  static async __editTasksProjectId(ids: string[], projectId: string) {
    try {
      let result = await super.__updateTasksProjectId(projectId, ids);
      return result;
    } catch (error) {
      logger.error({ __updateTasksProjectId: error });
    }
  }
  static async getTasksCSV(data: any) {
    try {
    } catch (error) {}
  }
}

export default TaskController;
