import { customeError } from "./../../utils/errorUtils";
import { Express, Request, Response } from "express";
import logger from "../../../logger";
import TaskController from "../../controllers/task";
import { TaskData } from "../../types/model/tasks";
import { createTaskSchema } from "../../services/validation";
import { webhookUpdateInterface } from "../../types/controller/Tasks";

const TaskReq = class TaskReq extends TaskController {
  static async handleCreateCard(req: Request, res: Response) {
    try {
      let TaskData: TaskData = req.body;
      if (TaskData.teamId === "") TaskData.teamId = null;
      let isValid = createTaskSchema.validate(TaskData);
      if (isValid.error) return res.status(400).send(isValid.error.details);
      let task = await super.createTask(TaskData, req.files);
      if (task) {
        return res.send(task);
      } else {
        return res.status(400).send(customeError("create_task_error", 400));
      }
    } catch (error: any) {
      console.log(new Error(error).message);
      logger.error({ handleCreateCardError: error });
      return res.status(500).send([{ message: error?.message }]);
    }
  }

  static async handleUpdateCard(req: Request, res: Response) {
    try {
      let TaskData: any = req.body;
      let task = await super.updateTask(TaskData);
      if (task) {
        return res.send(task);
      } else {
        return res.status(400).send(customeError("update_task_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateCardError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleWebhookUpdateCard(req: Request, res: Response) {
    try {
      let trelloData: webhookUpdateInterface = req.body;
      let task: any = await super.webhookUpdate(trelloData);
      return res.status(200).send(task);
    } catch (error) {
      logger.error({ handleWebhookUpdateCardError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleGetTasks(req: Request, res: Response) {
    try {
      let data: TaskData = req.query;
      let tasks = await super.getTasks(data);
      if (tasks) return res.status(200).send(tasks);
      else res.status(400).send(customeError("get_tasks_error", 400));
    } catch (error) {
      logger.error({ handleGetTasksError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleFilterTasks(req: Request, res: Response) {
    try {
      let data: any = req.body;
      let tasks = await super.filterTasks(data);
      if (tasks) return res.status(200).send(tasks);
      else res.status(400).send(customeError("get_tasks_error", 400));
    } catch (error) {
      logger.error({ handleGetTasksError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleMoveCard(req: Request, res: Response) {
    try {
      let { cardId, listId, status, list }: any = req.body;
      let task: any = await super.moveTaskOnTrello(
        cardId,
        listId,
        status,
        list
      );
      if (task?.error) return res.status(400).send(task?.message);
      return res.send(task);
    } catch (error) {
      logger.error({ handleMoveCardError: error });
    }
  }
  static async handleDeleteTasksByProjectId(req: Request, res: Response) {
    try {
      let id = req.body.id;
      let deleteResult = await super.deleteTasksByProjectId(id);
      if (deleteResult?.deletedCount) return res.status(200).send(deleteResult);
    } catch (error) {
      logger.error({ handleDeleteTasksByProjectIdError: error });
    }
  }
  static async handleDeleteTasks(req: Request, res: Response) {
    try {
      let ids = req.body.ids;
      let deleteResult = await super.deleteTasks(ids);
      if (deleteResult) return res.status(200).send(deleteResult);
      else res.status(400).send(customeError("delete_task_error", 400));
    } catch (error) {
      logger.error({ handleDeleteTasksError: error });
    }
  }
  static async handleDeleteTask(req: Request, res: Response) {
    try {
      let id = req.body.id;
      let deleteResult = await super.deleteTask(id);
      if (deleteResult._id) return res.status(200).send(deleteResult);
      else res.status(400).send(customeError("delete_task_error", 400));
    } catch (error) {
      logger.error({ handleDeleteTasksError: error });
    }
  }
  static async handleDownloadAttachment(req: Request, res: Response) {
    try {
      let cardId: string = req.query?.cardId.toString();
      let attachmentId = req.query?.attachmentId.toString();
      if (cardId && attachmentId) {
        let result = await super.downloadAttachment(cardId, attachmentId);
        if (result) return res.send(result);
        return res.status(400).send("Bad Request for downlaoding this file");
      } else
        res.status(400).send("Request values missed cardId and AttachmentId");
    } catch (error) {
      logger.error({ handleDownloadAttachmentError: error });
    }
  }
};

export default TaskReq;
