import { successMsg } from "./../../utils/successMsg";
import { customeError } from "./../../utils/errorUtils";
import { ProjectData } from "./../../types/model/Project";
import { Request, Response } from "express";
import logger from "../../../logger";
import ProjectController from "../../controllers/project";
import Client from "../../controllers/client";
import mongoose from "mongoose";
import TaskController from "../../controllers/task";
import { jwtVerify } from "../../services/auth";

const ProjectReq = class ProjectReq extends ProjectController {
  static async handleCreateProject(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("Authorization"));
      let projectData: ProjectData = req.body;
      if (!projectData) {
        return res.status(400).send(customeError("project_missing_data", 400));
      }
      let project = await super.createProject(projectData, decoded?.user?.id);
      if (project) {
        await Client.updateClientProcedure(projectData.clientId);
        return res.status(200).send(project);
      } else {
        return res.status(400).send(customeError("create_project_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateProjectErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateProject(req: Request, res: Response) {
    try {
      let decoded: any = await jwtVerify(req.header("Authorization"));
      let projectData: ProjectData = req.body;
      if (!projectData._id) {
        return res.status(400).send(customeError("project_missing_data", 400));
      }
      let project = await super.updateProject(projectData, decoded.user.id);
      if (project) {
        await Client.updateClientProcedure(project.clientId);
        return res.status(200).send(project);
      } else {
        return res.status(400).send(customeError("update_project_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateProjecttErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetProject(req: Request, res: Response) {
    try {
      let projectData: ProjectData = req.query;
      if (projectData._id)
        projectData._id = new mongoose.Types.ObjectId(projectData._id);
      let project = await super.getProject(projectData);
      if (project) {
        return res.status(200).send(project);
      } else {
        return res.status(400).send(customeError("get_project_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetProjectErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteProject(req: Request, res: Response) {
    try {
      let projectId: string = req.body.id;
      if (!projectId) {
        return res.status(400).send(customeError("project_missing_data", 400));
      }
      let deleteResult = await TaskController.deleteTasksByProjectId(projectId);
      if (deleteResult) {
        let project = await super.deleteProject(projectId);
        if (project) {
          await Client.updateClientProcedure(project.clientId);
          return res
            .status(200)
            .send(successMsg("projects_and_tasks_deleted", 200));
        }
      }
      return res.status(400).send(customeError("delete_project_error", 400));
    } catch (error) {
      logger.error({ handleDeleteProjectErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleSortProjects(req: Request, res: Response) {
    try {
      let sortBy: string = req.body.sortBy;
      if (!sortBy)
        return res
          .status(400)
          .send(customeError("sort_projects_params_empty", 400));
      let projects = await super.sortProjects(sortBy);
      if (projects) return res.status(200).send(projects);
    } catch (error) {
      logger.error({ sortProjectsError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleFilterProjects(req: Request, res: Response) {
    try {
      let filter = req.body;
      let projects = await super.filterProjects(filter);
      if (projects) return res.status(200).send({ result: projects });
      else
        return res
          .status(400)
          .send(customeError("filter_projects_result_empty", 400));
    } catch (error) {
      logger.error({ filterProjectsError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleSearchPorjects(req: Request, res: Response) {
    try {
      let search = req?.params?.searchStr;
      let result = await super.searchProjects(search);
      if (result) return res.status(200).send(result);
      else
        return res
          .status(400)
          .send(customeError("search_Proejcts_result_null", 400));
    } catch (error) {
      logger.error({ filterProjectsError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleDeleteProjects(req: Request, res: Response) {
    try {
      let data = req.body;
      let result = await super.deleteProjects(data);
      return res.status(200).send(result);
    } catch (error) {
      logger.error({ deleteAllProjectsError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default ProjectReq;
