import {
  AttachmentSchema,
  TaskInfo,
  TasksStatistics,
} from "./../../types/model/tasks";
import logger from "../../../logger";
import Tasks from "../../models/task";
import { TaskData } from "../../types/model/tasks";
import _ from "lodash";
import mongoose from "mongoose";
import Department from "../../models/Department";
import { taskNotFoundError } from "../../types/controller/Tasks";
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
      console.log(task, id);
      return task;
    } catch (error) {
      logger.error({ updateTaskDBError: error });
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
      task.lastMove = task.status;
      task.lastMoveDate = new Date().toUTCString();
      await task.updateOne(value);
      let result = await task.save();
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
      logger.error({ updateTaskDBError: error });
    }
  }
  /**
   * Delete Tasks where condition
   *
   * it must only used in deleting a department, so the board will also be deleted and all cards and lists inside.
   * If it's used for any other purpose will cause a big issue in which cards are still not deleted.
   * @param data BoardId
   * @returns deleteResult
   */
  static async __deleteTasksWhereDB(data: TaskData) {
    try {
      let result = await Tasks.deleteMany(data);
      if (result) return result;
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
      logger.error({ updateTaskDBError: error });
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
      console.log("task data", data);
      let task = await Tasks.findOne({ _id: id });
      if (!task) return taskNotFoundError;
      if (data?.attachedFiles?.length > 0) {
        data.attachedFiles = [...task.attachedFiles, ...data.attachedFiles];
      } else data.attachedFiles = task.attachedFiles;
      if (data?.deleteFiles && [...data?.deleteFiles].length > 0) {
        data.attachedFiles = data.attachedFiles.filter(
          (item) =>
            [...data.deleteFiles].findIndex(
              (file) => file.trelloId === item.trelloId
            ) < 0
        );
      }
      delete data?.deleteFiles;
      let update = await Tasks.findByIdAndUpdate(id, data, {
        lean: true,
        new: true,
      });
      return { error: null, task: update };
    } catch (error) {
      logger.error({ updateTaskDBError: error });
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
      if (data.name) filter.name = { $regex: data.name };
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
}
export default TaskDB;
