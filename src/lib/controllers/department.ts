import config from "config";
import logger from "../../logger";
import Department from "../models/Department";
import {
  IDepartment,
  IDepartmentState,
  ListTypes,
} from "../types/model/Department";
import TrelloActionsController from "./trello";
import { ObjectId } from "mongodb";
export default class DepartmentController {
  static async createDepartment(data: IDepartment) {
    return await DepartmentController.__createNewDepartment(data);
  }

  static async deleteAllDocs() {
    return await DepartmentController.__deleteAllDocs();
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
      if (department.name !== config.get("CreativeBoard")) {
        let response = await department.deleteDepartment();
        return response;
      } else
        return {
          error: "CreativeBoard",
          message:
            "Creative department must not be deleted, it includes all projects",
        };
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
      let depDoc = new Department({
        name: data.name,
        color: data.color,
        teams: data.teams,
        sideLists: data.sideLists,
        boardId: "",
        lists: ListTypes.map((item) => {
          return { name: item, listId: "" };
        }),
      });
      let validation = depDoc.createDepartmentValidate();
      if (validation.error) return validation.error.details[0];
      if (depDoc) {
        let { teams, lists, sideLists } = await depDoc.createDepartmentBoard();
        if (teams && lists && sideLists) {
          depDoc.teams = teams;
          depDoc.lists = lists;
          depDoc.sideLists = sideLists;
          return await depDoc.save();
        } else
          return {
            error: "trelloError",
            message: "Trello didn't create the board for a reason.",
          };
      }
    } catch (error: any) {
      if (error?.error === "MongoError" && error?.id) {
        await TrelloActionsController.deleteBoard(error?.boardId);
        return error;
      }
      logger.error({ createDepartmentError: error });
    }
  }

  static async __deleteAllDocs() {
    try {
      let boards = await Department.find({}).select("boardId");
      boards.map(
        async (item) => await TrelloActionsController.deleteBoard(item.boardId)
      );
      await Department.deleteMany({});
    } catch (error) {
      logger.error({ dropCollectionError: error });
    }
  }
  static async _updateDepartmentsPriority(ids: string[]) {
    try {
      // write a bulkwrite operation instead
      let result = await Department.updateMany(
        { _id: { $in: ids } },
        { priority: 1 }
      );
      let updateResult = await Department.updateMany(
        { _id: { $nin: ids } },
        { priority: 0 }
      );
      if (updateResult.acknowledged && result.acknowledged)
        return await Department.find();
      else return null;
    } catch (error) {
      logger.error({ _updateDepartmentsPriority: error });
    }
  }
}
