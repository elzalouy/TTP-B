import logger from "../../../logger";
import Project from "../../models/Project";
import { ProjectData, ProjectInfo } from "../../types/model/Project";

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
      return project;
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
      if (filter.projectManager) filters.projectManager = filter.projectManager;
      if (filter.projectStatus) filters.projectStatus = filter.projectStatus;
      if (filter.clientId) filters.clientId = filter.clientId;
      if (filter.name) filters.name = { $regex: filter.name };
      let project = await Project.find(filters)
        .populate({ path: "projectManager", select: "_id name" })
        .lean();
      return project;
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
