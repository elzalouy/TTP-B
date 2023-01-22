import { ProjectData } from "./../types/model/Project";
import config from "config";
import logger from "../../logger";
import ProjectDB from "../dbCalls/project/project";
import Tasks from "../models/Task";
import { io } from "../../index";
import NotificationController from "./notification";
import { projectQueue } from "../backgroundJobs/actions/project.actions.Queue";
import DepartmentController from "./department";
import Department from "../models/Department";
import TrelloActionsController from "./trello";

const ProjectController = class ProjectController extends ProjectDB {
  static async createProject(data: ProjectData, userId: string) {
    return await ProjectController.__createNewProject(data, userId);
  }

  static async updateProject(data: ProjectData, userId: string) {
    return await ProjectController.__updateProjectData(data, userId);
  }

  static async getProject(data: object) {
    return await ProjectController.__getProjectData(data);
  }

  static async deleteProject(id: string) {
    return await ProjectController.__deleteProjectData(id);
  }

  static async deleteProjects(data: ProjectData) {
    return await ProjectController.__deleteProjectsData(data);
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
      projectQueue.push(() => {
        if (project.cardId) TrelloActionsController.deleteCard(project.cardId);
      });
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

  static async __updateProjectData(data: ProjectData, userId: string) {
    try {
      let projectData: any = {
        name: data.name,
        idBoard: data.boardId,
        idList: data.listId,
      };
      console.log({ data });
      if (data.projectDeadline) projectData.due = data.projectDeadline;
      if (data.startDate) projectData.start = data.startDate;

      projectQueue.push((cb) => {
        TrelloActionsController.__updateCard({
          cardId: data.cardId,
          data: projectData,
        });
        NotificationController.__updateProjectNotification(data, userId);
        cb(null, true);
      });
      let project = await super.updateProjectDB(data);
      return project;
    } catch (error) {
      logger.error({ updateProjectError: error });
    }
  }

  static async __createNewProject(data: ProjectData, userId: string) {
    try {
      console.log({ data });
      let project = await super.createProjectDB(data);
      projectQueue.push(async (cb) => {
        let dep = await Department.findOne({
          name: config.get("CreativeBoard"),
        });
        if (dep) {
          let projectsList = dep.lists.find((item) => item.name === "projects");
          let { id } = await TrelloActionsController.__createProject(
            projectsList.listId,
            data
          );
          let result = await super.updateProjectDB({
            _id: project._id,
            cardId: id,
            boardId: dep.boardId,
            listId: projectsList.listId,
          });
          io.sockets.emit("update-projects", result);
        }
        NotificationController.__creatProjectNotification(data, userId);
        cb(null, true);
      });
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
  static async __deleteProjectsData(data: ProjectData) {
    try {
      let result = await super.deleteProjectsDB(data);
      if (result) return result;
      else return null;
    } catch (error) {
      logger.console.error({ searchPrjectsError: error });
    }
  }
};

export default ProjectController;
