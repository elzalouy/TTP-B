import logger from "../../logger";
import Department from "../models/Department";
import {
  IDepartment,
  IDepartmentState,
  ListTypes,
} from "../types/model/Department";
import BoardController from "./trello";
export default class DepartmentController {
  static async createDepartment(data: IDepartment) {
    return await DepartmentController.__createNewDepartment(data);
  }

  static async updateDepartment(id: string, data: IDepartmentState) {
    return await DepartmentController.__updateDepartmentData(id, data);
  }

  static async deleteDepartment(id: string) {
    return await DepartmentController.__deleteDepartmentData(id);
  }

  static async getDepartments() {
    return await DepartmentController.__getDepartmentsData();
  }

  static async __getDepartmentsData() {
    try {
      return await Department.find();
    } catch (error) {
      logger.error({ getDepartmentsError: error });
    }
  }

  static async __deleteDepartmentData(id: string) {
    try {
      let department = await Department.findById(id);
      if (!department)
        return { error: "NotFound", message: "Department was not found" };
      let response = await department.deleteDepartment();
      return response;
    } catch (error) {
      logger.error({ deleteDepartmentError: error });
    }
  }

  static async __updateDepartmentData(id: string, data: IDepartmentState) {
    try {
      // 1- get department
      let department: IDepartment = await Department.findOne({ _id: id });
      if (!department)
        return { error: "NotFound", message: "Department was not found" };
      //2- Validate & Update
      let validation = department.updateDepartmentValidate(data);
      if (validation.error) return validation.error.details[0];
      else {
        let response = await department.updateDepartment(data);
        response = await response.save();
        return response;
      }
    } catch (error) {
      logger.error({ updateDepartmentError: error });
      return error;
    }
  }

  static async __createNewDepartment(data: IDepartment) {
    try {
      // 1- Validation (Joi & Mongo)
      let depDoc = new Department({
        name: data.name,
        color: data.color,
        teams: data.teams,
        boardId: "",
        lists: ListTypes.map((item) => {
          return { name: item, listId: "" };
        }),
      });
      let validation = depDoc.createDepartmentValidate();
      if (validation.error) return validation.error.details[0];

      // 2-Create Board/Teams/lists
      if (depDoc) {
        let { teams, lists } = await depDoc.createDepartmentBoard();
        depDoc.teams = teams;
        depDoc.lists = lists;
        return await depDoc.save();
      }
    } catch (error: any) {
      if (error?.error === "MongoError" && error?.id) {
        await BoardController.deleteBoard(error?.boardId);
        return error;
      }
      logger.error({ createDepartmentError: error });
    }
  }
}
