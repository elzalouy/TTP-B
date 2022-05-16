import { TaskInfo, TasksStatistics } from "./../../types/model/tasks";
import logger from "../../../logger";
import Tasks from "../../models/task";
import { TaskData } from "../../types/model/tasks";
import Project from "../../models/Project";
import _ from "lodash";
import mongoose from "mongoose";
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

  static async updateOneTaskDB(data: object, value: object) {
    return await TaskDB.__updateOneTaskDB(data, value);
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

  static async getAllTasksDB(data: any) {
    return await TaskDB.__getAllTasks(data);
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
      let task = await Tasks.findById(id).lean();
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

  static async __updateOneTaskDB(data: object, value: object) {
    try {
      let task = await Tasks.updateOne(data, value, { new: true, lean: true });
      return task;
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
      await Project.findByIdAndUpdate(id, {
        numberOfTasks: 0,
        numberOfFinishedTasks: 0,
      });
      return deleteResult;
    } catch (error) {
      logger.error({ deleteTasksByProject: error });
    }
  }

  static async __deleteTasks(ids: string[]) {
    try {
      // let tasks = await Tasks.find({ _id: { $in: ids } }).lean();
      // let tasksUnique = _.uniqBy(tasks, (item: any) => item.projectId);
      // let projects = tasksUnique.map((item: any) => item.projectId);
      // projects.forEach(async (id: any) => {
      //   let done = tasks.filter(
      //     (item) => item.projectId === id && item.status === "done"
      //   ).length;
      //   let notDone = tasks.filter((item) => item.projectId === id).length;
      //   await Project.findByIdAndUpdate(id, {
      //     $inc: {
      //       numberOfTasks: -notDone,
      //       numberOfFinishedTasks: -done,
      //     },
      //   });
      // });
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
      if (task.status === "done")
        await Project.findByIdAndUpdate(task.projectId, {
          $inc: { numberOfTasks: -1, numberOfFinishedTasks: -1 },
        });
      else
        await Project.findByIdAndUpdate(task.projectId, {
          $inc: { numberOfTasks: -1 },
        });
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
      await Project.findByIdAndUpdate(task.projectId, {
        $inc: { numberOfTasks: 1, numberOfFinishedTasks: 0 },
      });
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
      if (data.projectManager) filter.projectManager = {$regex : data.projectManager};
      let tasks = await Tasks.find(filter);
      return tasks;
    } catch (error) {
      logger.error({ filterTasksError: error });
    }
  }
  static async __getAllTasksStatistics() {
    try {
      var statistics: TasksStatistics[] = [];
      let project = await Project.find({}).select("_id");
      await project.forEach(async (element, index) => {
        let finishedtasks = await Tasks.find({
          projectId: element._id,
          status: "done",
        });
        let tasks = await Tasks.find({ projectId: element._id });
        let NoOfFinished = finishedtasks.length;
        let NoOfTasks = tasks.length;
        statistics.push({
          id: element._id,
          numberOfFinishedTasks: NoOfFinished,
          numberOfTasks: NoOfTasks,
          progress: (NoOfFinished / NoOfTasks) * 100,
        });
      });
      return statistics;
    } catch (error) {
      logger.error({ AllTasksStatistics: error });
    }
  }
}
export default TaskDB;
