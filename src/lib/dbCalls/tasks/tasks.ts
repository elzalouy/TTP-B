import { TaskInfo } from "./../../types/model/tasks";
import logger from "../../../logger";
import Tasks from "../../models/task";
import { TaskData } from "../../types/model/tasks";

const TaskDB = class TaskDB {
  static async createTaskDB(data: TaskData) {
    return await TaskDB.__createTask(data);
  }

  static async updateTaskDB(data: any) {
    return await TaskDB.__updateTask(data);
  }

  static async deleteTaskDB(id: string) {
    return await TaskDB.__deleteTask(id);
  }

  static async getTaskDB(data: object) {
    return await TaskDB.__getTask(data);
  }

  static async __getTask(data: object) {
    try {
      let tasks = await Tasks.find(data).lean();
      return tasks;
    } catch (error) {
      logger.error({ updateTaskDBError: error });
    }
  }

  static async __deleteTask(id: string) {
    try {
      let task = await Tasks.findByIdAndDelete({ _id: id });
      return task;
    } catch (error) {
      logger.error({ deleteTaskDBError: error });
    }
  }

  static async __updateTask(data: any) {
    try {
      let id = data.id;
      delete data.id;
      let task = await Tasks.findByIdAndUpdate(
        { _id: id },
        { ...data },
        { new: true, lean: true }
      );
      return task;
    } catch (error) {
      logger.error({ updateTaskDBError: error });
    }
  }

  static async __createTask(data: TaskData) {
    try {
      let task: TaskInfo = new Tasks(data);
      await task.save();
      return task;
    } catch (error) {
      logger.error({ createTaskDBError: error });
    }
  }
};

export default TaskDB;
