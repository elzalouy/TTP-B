import { customeError } from "./../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import TaskController from "../../controllers/task";
import { TaskData } from "../../types/model/tasks";

const TaskReq = class TaskReq extends TaskController {
  static async handleCreateCard(req: Request, res: Response) {
    try {
      let TaskData: TaskData = req.body
      let task = await super.createTask(TaskData, req.file);
      if (task) {
        return res.send(task);
      } else {
        return res.status(400).send(customeError("create_task_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateCardError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateCard(req: Request, res: Response) {
    try {
      let TaskData: any = req.body
      // TaskData.file = req.file
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
      let trelloData: any = req.body
      let task: any = await super.webhookUpdate(trelloData)
      return res.status(200).send(task);
    } catch (error) {
      logger.error({ handleWebhookUpdateCardError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

}


export default TaskReq;
