import { ObjectId } from "bson";

import {
  DepartmentInfo,
  DepartmentData,
  UpdateDepartment,
} from "../../types/model/Department";
import logger from "../../../logger";
import Department from "../../models/Department";

const DepartmentBD = class DepartmentBD {
  static async createdbDepartment(data: DepartmentData) {
    return await DepartmentBD.__addNewDepartment(data);
  }

  static async updatedbDepartment(data: any) {
    return await DepartmentBD.__updateDepartment(data);
  }

  static async deleteDepartmentDB(id: string) {
    return await DepartmentBD.__deleteDepartment(id);
  }

  static async getDepartmentsData(data: object) {
    return await DepartmentBD.__getDepartment(data);
  }

  static async updateNestedRecordDepDB(DepId: string, Recordupdate: object) {
    return await DepartmentBD.__updateNestedRecordDepDB(DepId, Recordupdate);
  }

  static async __updateNestedRecordDepDB(DepId: string, Recordupdate: object) {
    try {
      let department = await Department.findOneAndUpdate(
        { _id: new ObjectId(DepId) },
        Recordupdate
      );

      return department;
    } catch (error) {
      logger.error({ deleteNestedRecordDepDBError: error });
    }
  }

  static async __getDepartment(data: object) {
    try {
      let department: any = await Department.aggregate([
        { $match: { $and: [data] } },
        {
          $lookup: {
            from: "tasks",
            localField: "tasks",
            foreignField: "_id",
            as: "tasks",
          },
        },
        {
          $lookup: {
            from: "techmembers",
            localField: "teamsId.idInDB",
            foreignField: "_id",
            as: "teamsId",
          },
        },
        {
          $addFields: {
            totalInProgress: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "inProgress"] },
              },
            },
            totalDone: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "done"] },
              },
            },
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            boardId: 1,
            color: 1,
            mainBoard: 1,
            teamsId: 1,
            canceldListId: 1,
            defaultListId: 1,
            doneListId: 1,
            notClearListId: 1,
            reviewListId: 1,
            sharedListID: 1,
            totalInProgress: {
              $size: "$totalInProgress",
            },
            totalDone: {
              $size: "$totalDone",
              // $map: {
              //   input: "$totalDone",
              //   as: "task",
              //   in: { _id: "$$task._id", status: "$$task.status" },
              // },
            },
          },
        },
      ]);
      return department;
    } catch (error) {
      logger.error({ getDepartmentDataError: error });
    }
  }

  static async __deleteDepartment(id: string) {
    try {
      let deletedDepartment = await Department.findOneAndDelete({ _id: id });
      return deletedDepartment;
    } catch (error) {
      logger.error({ deleteDepartmentError: error });
    }
  }

  static async __updateDepartment(data: any) {
    try {
      let id = data._id;
      delete data._id;
      let department = await Department.findByIdAndUpdate(
        { _id: id },
        { ...data },
        { new: true, lean: true }
      );
      return department;
    } catch (error) {
      logger.error({ updatedbDepartmentError: error });
    }
  }

  static async __addNewDepartment(data: DepartmentData) {
    try {
      logger.info({ data });
      let department = new Department(data);
      await department.save();
      return department;
    } catch (error) {
      logger.error({ createDepartmentError: error });
    }
  }
};

export default DepartmentBD;
