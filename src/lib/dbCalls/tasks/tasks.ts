import {
  AttachmentResponse,
  AttachmentSchema,
  TaskInfo,
  TasksStatistics,
} from "./../../types/model/tasks";
import logger from "../../../logger";
import Tasks, { FilesSchema, TaskFileSchema } from "../../models/Task";
import { TaskData } from "../../types/model/tasks";
import _ from "lodash";
import mongoose from "mongoose";
import Department from "../../models/Department";
import { taskNotFoundError } from "../../types/controller/Tasks";
import { ObjectId } from "mongodb";
import { io } from "../../..";
class TaskDB {
  static async createTaskDB(data: TaskData) {
    return await TaskDB.__createTask(data);
  }

  static async updateTaskDB(data: any) {
    return await TaskDB.__updateTask(data);
  }

  static async deleteTaskDB(id: string) {
    return await TaskDB.__deleteTask(id);
  }
  static async deleteTasksDB(ids: string[]) {
    return await TaskDB.__deleteTasks(ids);
  }

  static async updateTaskStatus(data: object, value: object) {
    return await TaskDB.__updateTaskStatus(data, value);
  }

  static async getTaskDepartmentDB(depId: string) {
    return await TaskDB.__getTaskDepartment(depId);
  }
  static async deleteTasksByProjectIdDB(id: string) {
    return await TaskDB.__deleteTasksByProjectId(id);
  }
  static async getTaskDB(id: string) {
    return await TaskDB.__getTask(id);
  }
  static async getOneTaskBy(data: TaskData) {
    return await TaskDB.__getOneTaskBy(data);
  }

  static async getAllTasksDB(data: any) {
    return await TaskDB.__getAllTasks(data);
  }

  static async deleteTasksWhereDB(data: TaskData) {
    return await TaskDB.__deleteTasksWhereDB(data);
  }
  static async updateTaskByTrelloDB(data: TaskData) {
    return await TaskDB.__updateTaskByTrelloDB(data);
  }
  static async deleteTaskByTrelloDB(data: TaskData) {
    return await TaskDB.__deleteTaskByTrelloDB(data);
  }
  static async archiveTaskByTrelloDB(data: TaskData, archive: boolean) {
    return await TaskDB.__archiveTaskByTrelloDB(data, archive);
  }
  static async __getAllTasks(data: any) {
    try {
      let tasks = Tasks.find(data).populate("memberId");
      return tasks;
    } catch (error) {
      logger.error({ getAllTasksDBError: error });
    }
  }

  static async __getTask(id: string) {
    try {
      let task = await Tasks.findOne({ _id: id });
      return task;
    } catch (error) {
      logger.error({ getTaskDBError: error });
    }
  }
  static async __getTaskDepartment(depId: string) {
    try {
      let taskCount = await Tasks.aggregate([
        {
          $facet: {
            inProgressTasks: [
              {
                $match: {
                  marchentID: new mongoose.Types.ObjectId(depId),
                  status: {
                    $in: ["inProgress", "shared", "not clear", "review"],
                  },
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
            doneTasks: [
              {
                $match: {
                  marchentID: new mongoose.Types.ObjectId(depId),
                  status: "delivered",
                },
              },
              {
                $group: {
                  _id: null,
                  count: {
                    $sum: 1,
                  },
                },
              },
            ],
          },
        },
      ]);
      return taskCount;
    } catch (error) {
      logger.error({ getTaskDepartmentDBError: error });
    }
  }

  static async __updateTaskStatus(data: TaskData, value: TaskData) {
    try {
      let task = await Tasks.findOne(data);
      let newdata = {
        ...value,
        lastMove: task.status,
        lastMoveDate: data.lastMoveDate,
      };
      let result = await Tasks.findOneAndUpdate(data, newdata, {
        new: true,
        lean: true,
      });
      return result;
    } catch (error) {
      logger.error({ updateMultiTaskDBError: error });
    }
  }
  static async getTasksDB(data: TaskData) {
    return await TaskDB.__getTasks(data);
  }
  static async getTasksByIdsDB(ids: string[]) {
    return await TaskDB.__getTasksByIds(ids);
  }
  static async __getTasksByIds(ids: string[]) {
    try {
      let tasks = await Tasks.find({ _id: { $in: ids } }).lean();

      return tasks;
    } catch (error) {
      logger.error({ getTasksByIdDBError: error });
    }
  }
  static async __deleteTasksWhereDB(data: TaskData) {
    try {
      let tasks = await Tasks.find(data);
      let result = await Tasks.deleteMany(data);
      if (result) return tasks;
      throw "Tasks not found";
    } catch (error) {
      logger.error({ deleteTasksWhereError: error });
    }
  }
  static async __getTasks(data: TaskData) {
    try {
      let tasks = await Tasks.find(data).lean();
      return tasks;
    } catch (error) {
      logger.error({ getTaskDBError: error });
    }
  }
  static async __deleteTasksByProjectId(id: String) {
    try {
      let deleteResult = await Tasks.deleteMany({ projectId: id });

      return deleteResult;
    } catch (error) {
      logger.error({ deleteTasksByProject: error });
    }
  }

  static async __deleteTasks(ids: string[]) {
    try {
      let deleteResult = await Tasks.deleteMany({ _id: { $in: ids } });
      if (deleteResult) {
        let remaind = await Tasks.find({});
        return remaind;
      } else throw "Error while deleting tasks";
    } catch (error) {
      logger.error({ deleteTasksError: error });
    }
  }

  static async __deleteTask(id: string) {
    try {
      let task = await Tasks.findByIdAndDelete(id);
      return task;
    } catch (error) {
      logger.error({ deleteTaskDBError: error });
    }
  }
  static async __updateTask(data: TaskData) {
    try {
      let id = data.id;
      delete data.id;
      let task = await Tasks.findOne({ _id: id }).lean();
      if (!task) return taskNotFoundError;

      task.name = data.name ? data.name : task.name;
      task.description =
        data?.description?.length > 0 ? data.description : task.description;
      task.deadline = data.deadline ? data.deadline : task.deadline;
      task.categoryId = data.categoryId
        ? new mongoose.Types.ObjectId(data.categoryId)
        : task.categoryId;
      task.subCategoryId = data.subCategoryId
        ? new mongoose.Types.ObjectId(data.subCategoryId)
        : task.subCategoryId;
      task.status = data.status ? data.status : task.status;
      task.cardId = data.cardId ? data.cardId : task.cardId;
      task.boardId = data.boardId ? data.boardId : task.boardId;
      task.listId = data.listId ? data.listId : task.listId;
      task.attachedFiles = data.deleteFiles
        ? task.attachedFiles.filter(
            (item) => item.trelloId === data.deleteFiles.trelloId
          )
        : task.attachedFiles;
      delete task._id;
      let update = await Tasks.findByIdAndUpdate(id, task, {
        new: true,
      });
      return { error: null, task: update };
    } catch (error) {
      logger.error({ updateTaskDBError: error });
    }
  }
  static async __updateTaskAttachments(
    data: TaskData,
    attachments: AttachmentSchema[]
  ) {
    try {
      let task = await Tasks.findOneAndUpdate(
        data,
        {
          $set: { attachedFiles: attachments },
        },
        { new: true, lean: true }
      );
      return task;
    } catch (error) {
      logger.error({ updateAttachmentsDBError: error });
    }
  }
  static async __createTask(data: TaskData) {
    try {
      let task: TaskInfo = new Tasks(data);
      task = await task.save();
      return task;
    } catch (error) {
      logger.error({ createTaskDBError: error });
    }
  }
  static async __filterTasksDB(data: {
    projectId: string;
    memberId: string;
    status: string;
    clientId: string;
    projectManager: string;
    name: string;
  }) {
    try {
      let filter: any = {};
      if (data.projectId) filter.projectId = data.projectId;
      if (data.memberId) filter.memberId = data.memberId;
      if (data.status) filter.status = data.status;
      if (data.name) {
        //Making search value to lower case for case insensitive search
        let name = data.name.toLowerCase();
        filter.name = { $regex: name };
      }
      if (data.projectManager)
        filter.projectManager = { $regex: data.projectManager };
      let tasks = await Tasks.find(filter);
      return tasks;
    } catch (error) {
      logger.error({ filterTasksError: error });
    }
  }
  static async __getOneTaskBy(data: TaskData) {
    try {
      let task = await Tasks.findOne(data).lean();
      if (task) return task;
      else return null;
    } catch (error) {
      logger.error({ getOneTaskError: error });
    }
  }
  static async __updateTaskByTrelloDB(data: TaskData) {
    try {
      let task = await Tasks.findOne({ cardId: data.cardId });
      task.name = data?.name ? data?.name : task.name;
      task.status = data?.status ? data.status : task.status;
      task.listId = data?.listId ? data.listId : task.listId;
      task.cardId = data?.cardId ? data.cardId : task.cardId;
      task.boardId = data?.boardId ? data.boardId : task.boardId;
      task.description = data.description ? data.description : task.description;
      task.teamId =
        data?.teamId === null || data?.teamId?.toString().length > 0
          ? new ObjectId(data.teamId)
          : task.teamId;
      task.lastMove = data?.lastMove ? data.lastMove : task.lastMoveDate;
      task.lastMoveDate = data?.lastMoveDate
        ? data.lastMoveDate
        : task.lastMoveDate;
      task.deadline = data?.deadline ? data.deadline : task.deadline;
      task.start = data?.start ? data.start : task.start;
      if (data.attachedFile) {
        let file = new TaskFileSchema({ ...data.attachedFile });
        task.attachedFiles.push(file);
        task = await task.save();
      }
      if (data.deleteFiles && data?.deleteFiles?.trelloId) {
        task.attachedFiles = _.filter(
          task.attachedFiles,
          (item) => item.trelloId !== data?.deleteFiles?.trelloId
        );
      }
      task.attachedFiles = _.uniqBy(task.attachedFiles, "trelloId");
      let result = await (await task.save()).toObject();
      await io.sockets.emit("update-task", result);
    } catch (error) {
      logger.error({ __updateTaskByTrelloDBError: error });
    }
  }
  static async __createTaskByTrelloDB(data: TaskData) {
    try {
      let result = await Tasks.findOne({ cardId: data.cardId });
      if (result) return result;
      else {
        let task = new Tasks(data);
        return await task.save();
      }
    } catch (error) {
      logger.error({ __createTaskByTrelloDBError: error });
    }
  }
  static async __deleteTaskByTrelloDB(data: TaskData) {
    try {
      let result = await Tasks.findOneAndDelete({ cardId: data.cardId });
      return io?.sockets?.emit("delete-task", result);
    } catch (error) {
      logger.error({ __deleteTaskByTrelloDBError: error });
    }
  }
  static async __archiveTaskByTrelloDB(data: TaskData, archive: boolean) {
    try {
      let taskData =
        archive === true ? { listId: null, status: "Archived" } : data;
      let archiveTask = await Tasks.findOneAndUpdate(
        { cardId: data.cardId },
        taskData,
        { new: true, lean: true }
      );
      return io?.sockets?.emit("update-task", archiveTask);
    } catch (error) {
      logger.error({ __archiveTaskByTrelloDBError: error });
    }
  }
}
export default TaskDB;
