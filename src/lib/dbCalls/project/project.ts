import logger from "../../../logger";
import Project from "../../models/Project";
import { ProjectData, ProjectInfo } from "../../types/model/Project";
const mongoose = require("mongoose");

const ProjectDB = class ProjectDB {
  static async createProjectDB(data: ProjectData) {
    return await ProjectDB.__createProject(data);
  }

  static async updateProjectDB(data: ProjectData) {
    return await ProjectDB.__updateProject(data);
  }

  static async getProjectDB(data: object) {
    return await ProjectDB.__getProject(data);
  }

  static async deleteProjectDB(id: string) {
    return await ProjectDB.__deleteProject(id);
  }
  static async sortProjectsDB(sortBy: string) {
    return await ProjectDB.__sortProjects(sortBy);
  }
  static async filterProjectsDB(filter: any) {
    return await ProjectDB.__filterProjects(filter);
  }
  static async searchProjectsDB(searchStr: string) {
    return await ProjectDB.__searchProjects(searchStr);
  }
  static async __deleteProject(id: string) {
    try {
      let project = await Project.findByIdAndDelete({ _id: id });
      return project;
    } catch (error) {
      logger.error({ deletProjectDBError: error });
    }
  }

  static async __getProject(data: object) {
    try {
      let project = await Project.find(data)
        .populate({ path: "projectManager", select: "_id name" })
        .lean();
      let fetch = await Project.aggregate([
        { $match: { $and: [data] } },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "projectId",
            as: "tasks",
          },
        },
        {
          $addFields: {
            NoOfFinishedTasks: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: {
                  $eq: ["$$task.status", "Done"],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            projectManager: 1,
            projectManagerName: 1,
            adminId: 1,
            projectDeadline: 1,
            startDate: 1,
            completedDate: 1,
            projectStatus: 1,
            clientId: 1,
            NoOfTasks: { $size: "$tasks" },
            NoOfFinishedTasks: { $size: "$NoOfFinishedTasks" },
          },
        },
      ]);
      fetch = await Project.populate(fetch, {
        path: "projectManager",
        select: "_id name",
      });
      return fetch;
    } catch (error) {
      logger.error({ getProjectDBError: error });
    }
  }

  static async __updateProject(data: ProjectData) {
    try {
      let id = data._id;
      delete data._id;
      let query: any = data;
      let project = await Project.findByIdAndUpdate({ _id: id }, query, {
        new: true,
        lean: true,
      });
      return project;
    } catch (error) {
      logger.error({ updateProjectDBError: error });
    }
  }

  static async __createProject(data: ProjectData) {
    try {
      let project: ProjectInfo = new Project(data);
      await project.save();
      return project;
    } catch (error) {
      logger.error({ createProjectDBError: error });
    }
  }
  static async __sortProjects(sortBy: string) {
    try {
      let projects = await Project.find({}).sort(sortBy);
      return projects;
    } catch (error) {
      logger.error({ sortProjectsDBError: error });
    }
  }
  static async __filterProjects(filter: any) {
    try {
      let filters: any = {};
      if (filter.projectManager)
        filters.projectManager = mongoose.Types.ObjectId(filter.projectManager);
      if (filter.projectStatus) filters.projectStatus = filter.projectStatus;
      if (filter.clientId)
        filters.clientId = mongoose.Types.ObjectId(filter.clientId);
      if (filter.name) filters.name = { $regex: filter.name };
      console.log([filters]);
      let fetch = await Project.aggregate([
        { $match: { $and: [filters] } },
        {
          $lookup: {
            from: "tasks",
            localField: "_id",
            foreignField: "projectId",
            as: "tasks",
          },
        },
        {
          $addFields: {
            NoOfFinishedTasks: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: {
                  $eq: ["$$task.status", "Done"],
                },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            projectManager: 1,
            projectManagerName: 1,
            adminId: 1,
            projectDeadline: 1,
            startDate: 1,
            completedDate: 1,
            projectStatus: 1,
            clientId: 1,
            NoOfTasks: { $size: "$tasks" },
            NoOfFinishedTasks: { $size: "$NoOfFinishedTasks" },
          },
        },
      ]);
      console.log(fetch);
      fetch = await Project.populate(fetch, {
        path: "projectManager",
        select: "_id name",
      });

      return fetch;
    } catch (error) {
      logger.error({ filterProjectsError: error });
    }
  }
  static async __searchProjects(searchStr: string) {
    try {
      let projects = await Project.find({ name: searchStr }).sort("asc");
      if (projects) return projects;
      else return null;
    } catch (error) {
      logger.error({ searchProjectsError: error });
    }
  }
};

export default ProjectDB;
