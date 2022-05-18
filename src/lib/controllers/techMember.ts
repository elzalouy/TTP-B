import { ListOfBoard } from "./../types/controller/techMembers";
import logger from "../../logger";
import TechMemberDB from "../dbCalls/techMember/techMember";
import { ITech, TechMemberData } from "../types/model/Team";
import { customeError } from "../utils/errorUtils";
import { localize } from "../utils/msgLocalize";
import BoardController from "./boards";
import DepartmentBD from "../dbCalls/department/department";

const TechMemberController = class TechMemberController extends TechMemberDB {
  static async createNewMember(data: TechMemberData) {
    return await TechMemberController.__createMember(data);
  }

  static async updateTechMember(data: TechMemberData) {
    return await TechMemberController.__updateMember(data);
  }

  static async getTechMember(data: object) {
    return await TechMemberController.__getTechMmber(data);
  }
  static async deleteTechMemberWhere(data: TechMemberData) {
    return await TechMemberController.__deleteTechMember(data);
  }
  static async __getTechMmber(data: object) {
    try {
      let techMember = await super.getTechMemberDB(data);
      return techMember;
    } catch (error) {
      logger.error({ getTechMemberError: error });
    }
  }
  static async __updateMember(data: TechMemberData) {
    try {
      const { boardId, trelloMemberId, listId, newBoardId, name } = data;
      let listIdValue = null;

      // I want to just remove member from board
      if (boardId === newBoardId) {
        await TechMemberController.__removeMemberAndList(
          listId,
          boardId,
          trelloMemberId
        );
      }

      // I want to move member from board to another
      if (newBoardId && newBoardId !== boardId) {
        let checkExsit: boolean =
          await TechMemberController.__checkBoardListName(newBoardId, name);
        logger.info({ checkExsit });
        if (checkExsit) {
          return;
        }

        await TechMemberController.__removeMemberAndList(
          listId,
          boardId,
          trelloMemberId
        );
        await BoardController.addMemberToBoard(
          newBoardId,
          trelloMemberId,
          "normal"
        );
        let list = await BoardController.addListToBoard(newBoardId, name);
        listIdValue = list.id;
        data.boardId = newBoardId;
      }

      // I want to update user name
      if (!newBoardId) {
        listIdValue = listId;
      }

      // Set list id to null
      data.listId = listIdValue;
      delete data.newBoardId;

      let updatedMember = await TechMemberDB.updateTechMember(data);
      return updatedMember;
    } catch (error) {
      logger.error({ updateTechMemberError: error });
    }
  }

  static async __createMember(data: TechMemberData) {
    try {
      const { name, boardId, departmentId } = data;
      if (!departmentId) customeError("department_missing", 400);
      let listId: { id: string } | null = null;
      if (boardId) {
        let checkExsit: boolean =
          await TechMemberController.__checkBoardListName(boardId, name);
        if (checkExsit) {
          return customeError("list_already_exsit", 400);
        }
        listId = await BoardController.addListToBoard(boardId, name);
        if (data.mainBaord) {
          return await BoardController.createWebHook(listId.id);
        }
      }
      let techMember = await super.createTechMember({
        ...data,
        listId: listId?.id,
      });
      DepartmentBD.updatedbDepartment({
        _id: data.departmentId,
        $push: {
          teamsId: { idInTrello: listId.id, idInDB: techMember._id },
        },
      });
      return { techMember, status: 200 };
    } catch (error) {
      logger.error({ createMemberError: error });
    }
  }

  static async __removeMemberAndList(
    listId: string,
    boardId: string,
    trelloMemberId: string
  ): Promise<() => void> {
    try {
      // Remove(archieve) the member list from board
      await BoardController.addListToArchieve(listId);
      // Remove member from board
      await BoardController.removeMemberFromBoard(boardId, trelloMemberId);
      return;
    } catch (error) {
      logger.error({ __removeMemberAndListError: error });
    }
  }

  static async __checkBoardListName(
    boardId: string,
    name: string
  ): Promise<boolean> {
    try {
      let check = false;
      // Get Lists in Board
      let boardList: ListOfBoard[] = await BoardController.getSingleBoardInfo(
        boardId,
        "lists"
      );
      for (let i = 0; i < boardList.length; i++) {
        if (name === boardList[i].name) {
          check = true;
        }
      }
      return check;
    } catch (error) {
      logger.error({ __checkBoardListNameError: error });
    }
  }
  static async __deleteTechMember(data: any) {
    try {
      return await TechMemberController.deleteTechMemberDB(data);
    } catch (error) {
      logger.error({ __deleteTechMemberError: error });
    }
  }
};

export default TechMemberController;
