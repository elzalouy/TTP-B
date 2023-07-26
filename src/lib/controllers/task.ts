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
import { taskRoutesQueue } from "../backgroundJobs/routes/tasks.Route.Queue";
import config from "config";
import {
  IDepartment,
  IDepartmentState,
  ListTypes,
} from "../types/model/Department";
import TrelloActionsController from "./trello";
import { Board, Card } from "../types/controller/trello";
import _, { uniqueId } from "lodash";
import Tasks from "../models/Task";
import { writeFile } from "fs";
import { randomUUID } from "crypto";
class TaskController extends TaskDB {
  static async getTasks(data: TaskData) {
    return await TaskController.__getTasks(data);
  }
  static async createTask(data: TaskData, files: any) {
    // TODO update this function with the new implementation
    return await TaskController.__CreateNewTask(data, files);
  }
  static async updateTask(data: object, files: any, tokenUser: any) {
    // TODO update this function with the new implementation
    return await TaskController.__updateTaskData(data, files, tokenUser);
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
    // TODO update this function with the new implementation
    return await TaskController.__createTaskByTrello(data);
  }

  static async moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    department: IDepartment,
    user: any,
    deadline?: string
  ) {
    // TODO update this function with the new implementation
    return await TaskController.__moveTaskOnTrello(
      cardId,
      listId,
      status,
      department,
      user,
      deadline
    );
  }

  static async __moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    department: IDepartmentState,
    user: any,
    deadline?: string
  ) {
    try {
      moveTaskJob(listId, cardId, status, department, user, deadline);
      return {
        data: `Task with cardId ${cardId} has moved to list ${
          department.lists.find((list) => list.listId === listId).name
        }`,
      };
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }

  static async __updateTaskData(
    data: TaskData,
    files: Express.Multer.File[],
    tokenUser: any
  ) {
    try {
      if (!data.cardId) return provideCardIdError;
      updateCardJob(data, files, tokenUser);
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

  /**
   * Create New Task
   * Create task with the initial data needed, it takes the initial data (taskData, and files)
   * * name (required)
   * * projectId (required)
   * * categoryId (optional)
   * * subCategoryId (optional)
   * * boardId (required)
   * * cardId (required)
   * * listId (required)
   * * status (required)
   * * start (required)
   * * description (optional)
   * * AttachedFiles [Array]
   *   * mimeType
   *   * id
   *   * name
   *   * url
   *   * fileName
   * * movements (at least 1)
   *   * index
   *   * status
   *   * movedAt
   * @param data TaskData
   * @param files TaskFiles
   * @returns Task
   */
  static async __CreateNewTask(data: TaskData, files: Express.Multer.File[]) {
    try {
      let task: TaskInfo;
      data.attachedFiles = [];
      let createdCard: { id: string } | any =
        await TrelloController.createCardInList(data);
      if (createdCard) {
        data.cardId = createdCard.id;
        data.trelloShortUrl = createdCard.shortUrl;
        if (data.teamId) data.assignedAt = new Date(Date.now());
        task = await super.createTaskDB(data);
        if (task) {
          taskRoutesQueue.push(async () => {
            data.cardId = createdCard.id;
            data.trelloShortUrl = createdCard.shortUrl;
            if (files.length > 0)
              data = await TaskController.__createTaskAttachment(files, data);
            TrelloController.createWebHook(data.cardId, "trelloWebhookUrlTask");
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
      let csvData = await Tasks.getTasksAsCSV(
        tasks
          .filter((item) => item.status === "Not Clear")
          .map((item) => item._id)
      );
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
            let isList = board.lists.find(
              (list) => list.listId === item.idList
            )?.name;
            let isStatusList =
              isList && ListTypes.includes(isList) ? true : false;
            let cardList = isList
              ? board.lists.find((list) => list.listId === item.idList)
              : board.teams.find((list) => list.listId === item.idList);
            let task: TaskData = {
              boardId: item.idBoard,
              cardId: item.id,
              trelloShortUrl: item.shortUrl,
              name: item.name,
              description: item.desc ?? "",
              start: item.start ?? null,
              deadline: item.due ?? null,
              listId: isList
                ? item.idList
                : board.lists.find((item) => item.name === "In Progress")
                    .listId,
              status: isList ?? "In Progress",
              movements: isTaskFound?.movements ?? [
                {
                  status: isList ? isList : "In Progress",
                  movedAt: new Date(Date.now()).toString(),
                },
              ],
            };
            if (isTaskFound?._id) {
              task.teamId = isStatusList ? isTaskFound.teamId : cardList._id;
              task = await Tasks.findOneAndUpdate({ cardId: item.id }, task);
            } else {
              task.teamId = isStatusList ? null : cardList._id;
              await new Tasks(task).save();
            }
            await TrelloActionsController.__addWebHook(
              task.cardId,
              "trelloWebhookUrlTask"
            );
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

  static async __editTasksProjectId(ids: string[], projectId: string) {
    try {
      let result = await super.__updateTasksProjectId(projectId, ids);
      return result;
    } catch (error) {
      logger.error({ __updateTasksProjectId: error });
    }
  }
  static async getTasksCSV(data: string[]) {
    try {
      let csvData = await Tasks.getTasksAsCSV(data);
      if (csvData) {
        let root = __dirname.split("/controllers")[0].concat("/uploads/");
        let fileName = `tasksSatatistics-${randomUUID()}.csv`;
        writeFile(
          root + fileName,
          csvData.toString(),
          { encoding: "utf8" },
          () => {}
        );
        return { fileName, root, csvData };
      }
    } catch (error) {
      logger.error({ _getTasksCsv: error });
    }
  }
}

export default TaskController;
