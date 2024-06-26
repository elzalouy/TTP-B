import { ObjectId } from "bson";
import logger from "../../../logger";
import Department from "../../models/Department";

const DepartmentBD = class DepartmentBD {
  static async createdbDepartment(data: any) {
    return await DepartmentBD.__addNewDepartment(data);
  }

  static async updatedbDepartment(data: any) {
    return await DepartmentBD.__updateDepartment(data);
  }

  static async deleteDepartmentDB(id: string) {
    return await DepartmentBD.__deleteDepartment(id);
  }

  static async getDepartmentsData(data: object, and: boolean) {
    return await DepartmentBD.__getDepartment(data, and);
  }

  static async updateNestedRecordDepDB(DepId: string, Recordupdate: object) {
    return await DepartmentBD.__updateNestedRecordDepDB(DepId, Recordupdate);
  }

  static async findDepByIdDB(id: string) {
    return await DepartmentBD.__findDepByIdDB(id);
  }

  static async __findDepByIdDB(id: string) {
    try {
      let department = await Department.findById(id).lean();
      return department;
    } catch (error) {
      logger.error({ findDepByIdDBDBError: error });
    }
  }
  static async __updateNestedRecordDepDB(DepId: string, Recordupdate: object) {
    try {
      let department = await Department.findOneAndUpdate(
        { _id: new ObjectId(DepId) },
        Recordupdate,
        { new: true, lean: true, populate: "teamsId" }
      );
      return department;
    } catch (error) {
      logger.error({ deleteNestedRecordDepDBError: error });
    }
  }
  static async __getOneDepartmentBy(data: any) {
    try {
      let dep = await Department.findOne(data);
      if (dep) return dep;
      return null;
    } catch (error) {
      logger.error({ getDepOneError: error });
    }
  }
  static async __getDepartment(data: any, and: boolean) {
    try {
      let match = and ? { $and: [data] } : { $or: [data] };
      let department: any = await Department.aggregate([
        { $match: match },
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
            from: "teams",
            localField: "teamsId.idInDB",
            foreignField: "_id",
            as: "teamData",
          },
        },
        {
          $addFields: {
            totalInProgress: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: {
                  $in: ["$$task.status", ["In Progress", "Shared", "Review"]],
                },
              },
            },
            totalDone: {
              $filter: {
                input: "$tasks",
                as: "task",
                cond: { $eq: ["$$task.status", "Done"] },
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
            boardURL: "$boardURL",
            mainBoard: 1,
            teamsId: "$teamData",
            teamOrigin: "$teamsId",
            canceldListId: 1,
            defaultListId: 1,
            doneListId: 1,
            notClearListId: 1,
            reviewListId: 1,
            sharedListID: 1,
            notStartedListId: 1,
            inProgressListId: 1,
            totalInProgress: {
              $size: "$totalInProgress",
            },
            totalDone: {
              $size: "$totalDone",
            },
          },
        },
      ]);
      // format my data
      for (let i = 0; i < department.length; i++) {
        department[i].teamsId = department[i].teamsId.map(
          (team: any, j: number) => {
            return {
              ...team,
              idInTrello: department[i]?.teamOrigin[j]?.idInTrello,
            };
          }
        );
        delete department[i]?.teamOrigin;
      }
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
        { new: true, lean: true, populate: "teamsId" }
      );
      return department;
    } catch (error) {
      logger.error({ updatedbDepartmentError: error });
    }
  }

  static async __addNewDepartment(data: any) {
    try {
      let department = new Department(data);
      await department.save();
      return department;
    } catch (error) {
      logger.error({ createDepartmentError: error });
    }
  }
};

export default DepartmentBD;
