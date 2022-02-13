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
        .populate({path:"projectManager",select:'_id name'})
        .populate({path:"teamsId",select:'_id name'})
        .lean();
      return project;
    } catch (error) {
      logger.error({ getProjectDBError: error });
    }
  }

  static async __updateProject(data: ProjectData) {
    try {
      let id = data.id;
      delete data.id;
      let project = await Project.findByIdAndUpdate(
        { _id: id },
        { ...data },
        { new: true, lean: true }
      );
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
};

export default ProjectDB;
