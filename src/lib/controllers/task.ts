import { TaskData } from "./../types/model/tasks";
import { customeError } from "./../utils/errorUtils";
import logger from "../../logger";
import TaskDB from "../dbCalls/tasks/tasks";
import BoardController from "./boards";

const TaskController = class TaskController extends TaskDB {
  static async getTasks(data: TaskData) {
    return await TaskController.__getTasks(data);
  }
  static async createTask(data: TaskData, file: any) {
    return await TaskController.__CreateNewTask(data, file);
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

  static async __webhookUpdate(data: object) {
    try {
      logger.info({ webhookUpdateData: data });
      return;
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

  static async __CreateNewTask(data: TaskData, file: string) {
    try {
      // Add task to the list
      let createdCard: { id: string } | any =
        await BoardController.createCardInList(data.listId, data.name, file);
      data.cardId = createdCard.id;
      // Check if there is attachment
      let attachment;
      if (file) {
        attachment = await BoardController.createAttachmentOnCard(
          createdCard.id,
          file
        );
      }
      // Add task to DB
      delete data.listId;
      let task = await super.createTaskDB(data);
      return { task, createdCard, attachment };
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
};

export default TaskController;
