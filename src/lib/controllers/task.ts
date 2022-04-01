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
          cardId,
        },
        {
          status,
        }
      );
      return task;
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }
  static async __webhookUpdate(data: any) {
    try {
      // This action fro removing card
      logger.info({ webhookUpdate: data });
      let targetTask;
      const targetList: string[] = [
        "done",
        "Shared",
        "Review",
        "Tasks Board",
        "Unclear brief",
        "cancel",
      ];
      if (targetList.includes(data.action.display.listAfter.text)) {
        targetTask = await TaskDB.updateOneTaskDB(
          {
            cardId: data.action.display.entities.card.id,
          },
          {
            status: data.action.display.listAfter.text,
          }
        );
      } else {
        targetTask = await TaskDB.updateOneTaskDB(
          {
            cardId: data.action.display.entities.card.id,
          },
          {
            status: "In Progress",
          }
        );
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
