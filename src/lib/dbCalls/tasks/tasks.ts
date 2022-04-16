import { TaskInfo } from "./../../types/model/tasks";
import logger from "../../../logger";
import Tasks from "../../models/task";
import { TaskData } from "../../types/model/tasks";
import ProjectDB from "../project/project";
import { ObjectId } from "mongoose/node_modules/mongodb";

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

  static async updateOneTaskDB(data: object, value: object) {
    return await TaskDB.__updateOneTaskDB(data, value);
  }

  static async getTaskDepartmentDB(depId: string) {
    return await TaskDB.__getTaskDepartment(depId);
  }

  static async __getTaskDepartment(depId: string) {
    try {
      let taskCount = await Tasks.aggregate([
        {
          $facet: {
            inProgressTasks: [
              {
                $match: {
                  marchentID: new ObjectId(depId),
                  status: "inProgress",
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
                  marchentID: new ObjectId(depId),
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

  static async __updateOneTaskDB(data: object, value: object) {
    try {
      let task = await Tasks.updateOne(
        { ...data },
        { value },
        { new: true, lean: true }
      );
      return task;
    } catch (error) {
      logger.error({ updateMultiTaskDBError: error });
    }
  }
  static async getTasksDB(data: object) {
    return await TaskDB.__getTasks(data);
  }

  static async __getTasks(data: object) {
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
      task = await task.save();
      let projectId = task.projectId.toString();
      let tasks = await (await Tasks.find({ projectId: projectId })).length;
      await ProjectDB.updateProjectDB({
        _id: projectId,
        numberOfTasks: tasks,
      });
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
  }) {
    try {
      let filter: any = {};
      if (data.projectId) filter.projectId = data.projectId;
      if (data.memberId) filter.memberId = data.memberId;
      if (data.status) filter.status = data.status;
      console.log(data);
      let tasks = await Tasks.find(filter);
      console.log(tasks);
      return tasks;
    } catch (error) {
      logger.error({ filterTasksError: error });
    }
  }
};
export default TaskDB;
