import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import DepartmentController from "../../controllers/department";
import { IDepartmentState } from "../../types/model/Department";

const DepartmentReq = class DepartmentReq extends DepartmentController {
  static async handleUpdateDepartmentsPriority(req: Request, res: Response) {
    try {
      console.log({ ids: req.body.ids });
      let result = await super._updateDepartmentsPriority(req.body.ids);
      if (result) res.send(result);
      else
        return res
          .status(400)
          .send("Issue hapenned while updating the priority of departments");
    } catch (error) {
      logger.error({ handleUpdateDepartmentsPriorityError: error });
    }
  }
  static async handleCreateDepartment(req: Request, res: Response) {
    try {
      let response: any = await super.createDepartment(req.body);
      if (response?.error || response?.message)
        return res.status(400).send(response?.message);
      if (response) {
        return res.status(200).send(response);
      } else {
        return res.status(400).send(customeError("create_dep_error", 400));
      }
    } catch (error) {
      logger.error({ handleCreateDepartmentDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateDepartment(req: Request, res: Response) {
    try {
      let departmentData: IDepartmentState = req.body;
      let id = req.params.id;

      let response: any = await super.updateDepartment(id, departmentData);
      if (response?.error || response?.message)
        return res.status(400).send(response?.message);
      if (response) {
        return res.status(200).send(response);
      } else {
        return res.status(400).send(customeError("create_dep_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateDepartmentDataError: error });
      return res.status(400).send(error);
    }
  }

  static async handleDeleteDepartment(req: Request, res: Response) {
    try {
      let id = req.params.id;
      if (id) {
        let response: any = await super.deleteDepartment(id);
        if (response?.error) return res.status(400).send(response.message);
        return res.status(200).send(response);
      } else
        return res
          .status(400)
          .send("Request should have an id in the query params");
    } catch (error) {
      logger.error({ handleDeletDepartmentDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetDepartment(req: Request, res: Response) {
    try {
      let department = await super.getDepartments();
      if (department) {
        return res.status(200).send(department);
      } else {
        return res.status(400).send(customeError("get_dep_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletDepartmentDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleDropTestCollection(req: Request, res: Response) {
    try {
      await super.deleteAllDocs();
      return res.status(200).send("done");
    } catch (error) {
      logger.error({ handleDropTestCollection: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default DepartmentReq;
