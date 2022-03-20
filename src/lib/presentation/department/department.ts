import { UpdateDepartment, DepartmentData } from "../../types/model/Department";
import { successMsg } from "../../utils/successMsg";
import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import DepartmentController from "../../controllers/department";

const DepartmentReq = class DepartmentReq extends DepartmentController {
  static async handleCreateDepartment(req: Request, res: Response) {
    try {
      let department = await super.createDepartment(req.body);
      if (department) {
        return res.status(200).send(department);
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
      let departmentData: UpdateDepartment = req.body;
      logger.info({ departmentData });
      if (!departmentData) {
        return res.status(400).send(customeError("update_dep_error", 400));
      }

      let department = await super.updateDepartment(departmentData);
      logger.info({ department });

      if (department) {
        return res.status(200).send(department);
      } else {
        return res.status(400).send(customeError("update_dep_error", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateDepartmentDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteDepartment(req: Request, res: Response) {
    try {
      let { _id, listTrelloIds, mainBoard, boardId } = req.body;
      if (!_id || !listTrelloIds || mainBoard === undefined || !boardId) {
        return res.status(400).send(customeError("delete_dep_error", 400));
      }

      let department = await super.deleteDepartment({
        _id,
        listTrelloIds,
        mainBoard,
        boardId,
      });
      if (department) {
        return res.status(200).send(successMsg("delete_dep_success", 200));
      } else {
        return res.status(400).send(customeError("delete_dep_error", 400));
      }
    } catch (error) {
      logger.error({ handleDeletDepartmentDataError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetDepartment(req: Request, res: Response) {
    try {
      let data: object = req.query;
      if (!data) {
        return res.status(400).send(customeError("get_dep_error", 400));
      }

      let department = await super.getDepartments(data);
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
};

export default DepartmentReq;
