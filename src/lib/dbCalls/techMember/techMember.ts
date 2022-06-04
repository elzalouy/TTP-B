import { TeamsData, DataUpdate } from "../../types/model/Team";
import logger from "../../../logger";
import TechMember from "../../models/teams";

const TechMemberDB = class TechMemberDB {
  static async createTechMember(data: TeamsData) {
    return await TechMemberDB.__addTechMember(data);
  }

  static async updateTechMember(data: TeamsData) {
    return await TechMemberDB.__updateMember(data);
  }

  static async getTechMemberDB(data: object) {
    return await TechMemberDB.__getTechMmber(data);
  }

  static async updateTechMembersDB(data: DataUpdate) {
    return await TechMemberDB.__updateTechMembersDB(data);
  }
  static async deleteTechMemberDB(data: TeamsData) {
    return await TechMemberDB.__deleteTechMemberDB(data);
  }
  static async __updateTechMembersDB(data: DataUpdate) {
    try {
      let ids = data.ids;
      delete data.ids;

      let techMembers = await TechMember.updateMany(
        { id: { $in: ids } },
        { ...data },
        { multi: true }
      );
      return techMembers;
    } catch (error) {
      logger.error({ updateTechMembersDBDBError: error });
    }
  }
  static async __getTechMmber(data: object) {
    try {
      let techMember = await TechMember.find(data).lean();
      return techMember;
    } catch (error) {
      logger.error({ getTechMemberDBError: error });
    }
  }

  static async __updateMember(data: TeamsData) {
    try {
      let id = data.id;
      delete data.id;
      logger.info({ data });
      let techMember = await TechMember.findOneAndUpdate(
        { _id: id },
        { ...data },
        { new: true, lean: true }
      );
      return techMember;
    } catch (error) {
      logger.error({ updateTechMemberError: error });
    }
  }

  static async __addTechMember(data: TeamsData) {
    try {
      let techMember = new TechMember(data);
      await techMember.save();
      return techMember;
    } catch (error) {
      logger.error({ addTechMemberError: error });
    }
  }
  
  static async __deleteTechMemberDB(data: TeamsData) {
    try {
      let deleteResult = await TechMember.deleteMany(data);
      if (deleteResult && deleteResult.deletedCount > 0) return deleteResult;
      else return "Delete result is 0 document";
    } catch (error) {
      logger.error({ deleteTechMemberError: error });
    }
  }
};

export default TechMemberDB;
