import { successMsg } from './../../utils/successMsg';
import { customeError } from './../../utils/errorUtils';
import { ProjectData } from './../../types/model/Project';
import { Request, Response } from "express";
import logger from "../../../logger";
import ProjectController from "../../controllers/project";

const ProjectReq = class ProjectReq extends ProjectController {
  static async handleCreateProject(req: Request, res: Response) {
    try {
      let projectData:ProjectData = req.body
      if(!projectData){
        return res.status(400).send(customeError("project_missing_data",400))
      }
      let project = await super.createProject(projectData);
      if (project) {
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
      let projectData:ProjectData = req.body
      if(!projectData.id){
        return res.status(400).send(customeError("project_missing_data",400))
      }
      let project = await super.updateProject(projectData);
      if (project) {
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
      let projectData:ProjectData = req.body.query
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
      let projectId:string = req.body.id
      if(!projectId){
        return res.status(400).send(customeError("project_missing_data",400))
      }
      let project = await super.deleteProject(projectId); 
      if (project) {
        return res.status(200).send(successMsg("project_deleted",200));
      } else {
        return res.status(400).send(customeError("delete_project_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeleteProjectErrors: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default ProjectReq;
