import { customeError } from "./../../utils/errorUtils";
import { Express, Request, Response } from "express";
import logger from "../../../logger";
import TaskController from "../../controllers/task";
import { AttachmentSchema, TaskData } from "../../types/model/tasks";
import { createTaskSchema, editTaskSchema } from "../../services/validation";
import { updateTaskAttachmentsJob } from "../../backgroundJobs/actions/task.actions.Queue";
import { jwtVerify } from "../../services/auth";
import { taskRoutesQueue } from "../../backgroundJobs/routes/tasks.Route.Queue";
import { deleteAll } from "../../services/upload";
import path from "path";
import { createReadStream, readFileSync, statSync } from "fs";
import TrelloController from "../../controllers/trello";
import { Board, TrelloAction } from "../../types/controller/trello";
import _ from "lodash";

const TaskReq = class TaskReq extends TaskController {
  static async handleCreateTask(req: Request, res: Response) {
    taskRoutesQueue.push(async (cb) => {
      try {
        const token = req.header("authorization");
        const decoded: any = await jwtVerify(token);
        console.log({ action: "DELETE_TASKS_FROM_TTP", user: decoded });
        let TaskData: TaskData = req.body;
        let isValid = createTaskSchema.validate(TaskData);
        if (isValid.error)
          return res.status(400).send(isValid.error.details[0]);
        let result = await super.createTask(TaskData, req.files);
        if (result) return res.send(result);
        else
          res.status(400).send({
            error: "createTaskError",
            message: "Something wrong hapenned while creating the task.",
          });
      } catch (error: any) {
        logger.error({ handleCreateTaskError: error });
      }
    });
  }

  static async handleUpdateCard(req: Request, res: Response) {
    try {
      taskRoutesQueue.push(async (cb) => {
        let tokenUser = await jwtVerify(req.header("Authorization"));
        let TaskData: any = req.body;
        if (TaskData.teamId === "" || TaskData.teamId === null)
          TaskData.teamId = null;
        let files = req.files;
        let deleteFiles: AttachmentSchema[];
        if (TaskData.deleteFiles)
          deleteFiles = TaskData.deleteFiles
            ? JSON.parse(TaskData?.deleteFiles)
            : [];
        TaskData.deleteFiles = deleteFiles;
        let validate = editTaskSchema.validate(TaskData);
        if (validate.error)
          return res.status(400).send(validate.error.details[0]);
        await super.updateTask(TaskData, files, tokenUser);
        return res.send({ message: "Task updated Sucessfully" });
      });
    } catch (error) {
      logger.error({ handleUpdateCardError: error });
      return res.status(400).send(customeError("update_task_error", 400));
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
    }
  }

  static async handleMoveCard(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("authorization"));
      if (decoded) {
        let { cardId, listId, status, department, deadline }: any = req.body;
        let task: any = await super.moveTaskOnTrello(
          cardId,
          listId,
          status,
          department,
          decoded,
          deadline
        );
        if (task?.error) return res.status(400).send(task?.message);
        return res.send(task);
      }
    } catch (error) {
      logger.error({ handleMoveCardError: error });
    }
  }

  static async handleDeleteTasksByProjectId(req: Request, res: Response) {
    try {
      const token = req.header("authorization");
      const decoded: any = await jwtVerify(token);
      console.log({ action: "DELETE_TASKS_FROM_TTP", user: decoded });
      let id = req.body.id;
      let deleteResult = await super.deleteTasksByProjectId(id);
      if (deleteResult?.deletedCount) return res.status(200).send(deleteResult);
    } catch (error) {
      logger.error({ handleDeleteTasksByProjectIdError: error });
    }
  }

  static async handleDeleteTasks(req: Request, res: Response) {
    try {
      const token = req.header("authorization");
      const decoded: any = await jwtVerify(token);
      console.log({ action: "DELETE_TASKS_FROM_TTP", user: decoded });
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
      const token = req.header("authorization");
      const decoded: any = await jwtVerify(token);
      console.log({ action: "DELETE_TASKS_FROM_TTP", user: decoded });
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
        if (result === undefined) {
          updateTaskAttachmentsJob({ cardId: cardId });
        }
        if (result) return res.send(result);
        return res.status(400).send("Bad Request for downlaoding this file");
      } else
        res.status(400).send("Request values missed cardId and AttachmentId");
    } catch (error) {
      logger.error({ handleDownloadAttachmentError: error });
    }
  }

  static async hanldeEditTasksProjectId(req: Request, res: Response) {
    try {
      let ids: string[] = req.body.ids,
        projectId = req.body.projectId;
      if (ids && projectId) {
        let response = await super.__editTasksProjectId(ids, projectId);
        if (response.modifiedCount) return res.send(response);
        return res
          .status(400)
          .send({ message: "something wrong happened", error: response });
      }
    } catch (error) {
      logger.error({ handleEditTasksProjectIdError: error });
    }
  }

  static async handleGetTasksCSV(req: Request, res: Response) {
    try {
      await deleteAll();
      let { fileName, root } = await super.getTasksCSV(req.body.ids);
      let file = createReadStream(root + fileName);
      res.setHeader("Content-disposition", `attachment; filename=${fileName}`);
      res.contentType("text/csv");
      file.pipe(res);
    } catch (error) {
      logger.error({ handleGetTasksCsvError: error });
    }
  }
};

export default TaskReq;
