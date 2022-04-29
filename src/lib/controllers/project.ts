import { ProjectData } from "./../types/model/Project";
import { customeError } from "./../utils/errorUtils";
import logger from "../../logger";
import ProjectDB from "../dbCalls/project/project";
import Tasks from "../models/task";
import { io } from "../server";
import NotificationController from "./notification";

const ProjectController = class ProjectController extends ProjectDB {
  static async createProject(data: ProjectData) {
    return await ProjectController.__createNewProject(data);
  }

  static async updateProject(data: ProjectData) {
    return await ProjectController.__updateProjectData(data);
  }

  static async getProject(data: object) {
    return await ProjectController.__getProjectData(data);
  }

  static async deleteProject(id: string) {
    return await ProjectController.__deleteProjectData(id);
  }
  static async sortProjects(sortBy: string) {
    return await ProjectController.__sortProjects(sortBy);
  }
  static async filterProjects(filter: any) {
    return await ProjectController.__filterProjects(filter);
  }
  static async searchProjects(searchStr: string) {
    return await ProjectController.__searchProjects(searchStr);
  }

  static async __deleteProjectData(id: string) {
    try {
      let project = await super.deleteProjectDB(id);
      return project;
    } catch (error) {
      logger.error({ getProjectError: error });
    }
  }

  static async __getProjectData(data: object) {
    try {
      let project = await super.getProjectDB(data);
      return project;
    } catch (error) {
      logger.error({ getProjectError: error });
    }
  }


  static async __updateProjectData(data: ProjectData) {
    try {
      // if porject status update to done
      if(data.projectStatus && ["delivered on time","delivered defore deadline"].includes(data.projectStatus)){
        let createNotifi = await NotificationController.createNotification({
          title:`${data.name} project is done! Congratulations!`,
          projectManagerID:data.projectManager,
          description:`${data.name} project is done! Thank you for your hard work`,
          clientName:data.clientId,
          projectID:data._id,
          adminUserID:data.adminId
        })
        // send notification to all admin
        io.to("admin room").emit('notification update',createNotifi)

          // send notification to specific project manager
      io.to(`user-${data.projectManager}`).emit("notification update", createNotifi)
      }
      let project = await super.updateProjectDB(data);
      return project;
    } catch (error) {
      logger.error({ updateProjectError: error });
    }
  }

  static async __createNewProject(data: ProjectData) {
    try {
      let project = await super.createProjectDB(data);

      let createNotifi = await NotificationController.createNotification({
        title: `${data.projectManagerName} project has been assigend to you`,
        description: `${data.name} has been assigend to you by ${data.adminName}`,
        projectManagerID: data.projectManager,
        projectID:data._id,
        adminUserID:data.adminId
      });

      // send notification to specific project manager
      io.to(`user-${data.projectManager}`).emit("notification update", createNotifi)

      return project;
    } catch (error) {
      logger.error({ getTeamsError: error });
    }
  }

  static async __sortProjects(sortBy: string) {
    try {
      let projects = await super.sortProjectsDB(sortBy);
      return projects;
    } catch (error) {
      logger.error({ sortProjectsError: error });
    }
  }

  static async __filterProjects(filter: any) {
    try {
      let projects = await super.filterProjectsDB(filter);
      return projects;
    } catch (error) {
      logger.error({ flterProjectsError: error });
    }
  }

  static async __searchProjects(searchStr: string) {
    try {
      let projects = await super.searchProjectsDB(searchStr);
      if (projects) return projects;
      else return null;
    } catch (error) {
      logger.console.error({ searchPrjectsError: error });
    }
  }
};

export default ProjectController;
