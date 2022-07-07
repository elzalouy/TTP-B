import logger from "../../logger";
import { createOneJob, DepartmentQueue } from "../background/departmentsQueue";
import Procedures from "../db/procedures";
import DepartmentBD from "../dbCalls/department/department";
import TechMemberDB from "../dbCalls/techMember/techMember";
import { createBoardResponse } from "../types/controller/board";
import {
  UpdateDepartment,
  DepartmentData,
  DepartmentInfo,
} from "../types/model/Department";
import BoardController from "./trello";

const DepartmentController = class DepartmentController extends DepartmentBD {
  static async createDepartment(data: DepartmentData) {
    return await DepartmentController.__createNewDepartment(data);
  }

  static async updateDepartment(data: UpdateDepartment) {
    return await DepartmentController.__updateDepartmentData(data);
  }

  static async deleteDepartment(data: { _id: any }) {
    return await DepartmentController.__deleteDepartmentData(data);
  }

  static async getDepartments(data: object, and: boolean) {
    return await DepartmentController.__getDepartmentsData(data, and);
  }

  static async __getDepartmentsData(data: object, and: boolean) {
    try {
      let departments = await super.getDepartmentsData(data, and);
      return departments;
    } catch (error) {
      logger.error({ getDepartmentsError: error });
    }
  }

  static async __deleteDepartmentData(data: { _id: any }) {
    try {
      const { _id } = data;
      let myDepartment = await super.findDepByIdDB(_id);

      let teamId: string[] = [];
      if (myDepartment?.mainBoard) {
        myDepartment.teamsId.map((team: any) => {
          return teamId.push(team.idInTrello);
        });
      }

      let listTrelloIds = [
        myDepartment?.canceldListId,
        myDepartment?.defaultListId,
        myDepartment?.doneListId,
        myDepartment?.notClearListId,
        myDepartment?.reviewListId,
        myDepartment?.sharedListID,
        ...teamId,
      ];

      // if it was main Board remove the webhooks
      if (myDepartment.mainBoard) {
        let hookRemove = listTrelloIds.map(async (id) => {
          return await BoardController.removeWebhook(id);
        });

        Promise.all(hookRemove).then((res) =>
          logger.info({ removeWebhookSucced: "done" })
        );
      }
      await BoardController.deleteBoard(myDepartment?.boardId);
      let deleteDepartment = await super.deleteDepartmentDB(_id);
      if (deleteDepartment?._id) {
        Procedures.deleteDepartmentProcedure(deleteDepartment);
        return deleteDepartment;
      } else throw "Department With this id not existed";
    } catch (error) {
      logger.error({ deleteDepartmentError: error });
    }
  }

  static async __updateDepartmentData(data: UpdateDepartment) {
    try {
      let depUpdate: any;
      // update board color and name
      if (data.name && data.color) {
        logger.info("first step");
        let boardData = {
          name: data.name,
          color: data.color,
          _id: data._id,
        };
        await BoardController.updateBoard(data.boardId, boardData);
        depUpdate = await super.updatedbDepartment(boardData);
      }

      // if not undefine then there is an action needed
      // make mainBoard or not
      // if (data.mainBoard !== undefined && data.teams) {
      //   logger.info("second step");

      //   // if false => remove the webhook
      //   if (!data.mainBoard) {
      //     let hookRemove = data.teams.map(async (id) => {
      //       return await BoardController.removeWebhook(id);
      //     });
      //     logger.info("third step");

      //     Promise.all(hookRemove).then((res) =>
      //       logger.info({ removeWebhookSucced: "done" })
      //     );
      //   }
      //   // if true => create the webhook
      //   if (data.mainBoard) {
      //     logger.info("fourth step");

      //     let hookAdd = data.teams.map(async (id) => {
      //       return await BoardController.createWebHook(id);
      //     });

      //     Promise.all(hookAdd).then((res) =>
      //       logger.info({ addWebhookSucced: "done" })
      //     );
      //   }
      // }

      //todo add team or remove team
      // if remove team
      if (data.removeTeam) {
        let hookListremove = data.removeTeam.map(async (id) => {
          // remove team list
          return await BoardController.addListToArchieve(id);
          // remove webhook
          // return await BoardController.removeWebhook(id);
        });
        Promise.all(hookListremove).then((res) =>
          logger.info({ removeListAndWebhookSucced: "done" })
        );
        logger.info({ removeTeam: data.removeTeam });
        // remove team
        depUpdate = await super.updateNestedRecordDepDB(data._id, {
          $pull: {
            teamsId: {
              idInTrello: { $in: data.removeTeam },
            },
          },
        });
      }

      // If add team
      if (data.addTeam) {
        let teamListIds: { idInTrello: string; idInDB: any }[] =
          await DepartmentController.__createTeamAndList(
            data.addTeam,
            data.boardId
          );
        logger.info({ title: "testing", teamListIds });
        // add team
        depUpdate = await super.updateNestedRecordDepDB(data._id, {
          $push: {
            teamsId: { $each: teamListIds, $position: 0 },
          },
        });
      }
      logger.info({ depUpdate });
      return depUpdate;
    } catch (error) {
      logger.error({ updateDepartmentError: error });
    }
  }

  static async __createNewDepartment(data: DepartmentData) {
    try {
      let boardData: createBoardResponse = await BoardController.createNewBoard(
        data.name,
        data.color
      );
      if (boardData.id) {
        let departmentResult: DepartmentInfo = await super.createdbDepartment({
          name: data.name,
          color: data.color,
          boardId: boardData.id,
          mainBoard: data.mainBoard,
          boardURL: boardData.url,
        });
        createOneJob(departmentResult, data.teams);
        DepartmentQueue.start();
        if (!departmentResult._id)
          return {
            error: "department",
            message: "error happened while creating department",
          };
        return departmentResult;
      } else
        return {
          error: "board",
          message: "error happened while creating board",
        };
    } catch (error) {
      logger.error({ createDepartmentError: error });
    }
  }

  // This update department ref in team record in db and update department record
  static async __createTeamList(
    teams: { _id: string; name: string }[],
    departId: string,
    data: object
  ) {
    try {
      let ids: string[] = teams.map((team) => team._id);

      // update team record with the department id (commented out because this is causing a bug)
      /*  await TechMemberDB.updateTechMembersDB({ ids, departmentId: departId }); */

      // update my department with the ids for the team in trello
      return await super.updatedbDepartment({ _id: departId, ...data });
    } catch (error) {
      logger.error({ createTeamListError: error });
    }
  }

  static async __createTeamAndList(
    teams: { name: string; _id: string }[],
    boardId: string
  ) {
    try {
      let teamListIds: { idInTrello: string; idInDB: any; name: string }[] = [];
      if (teams) {
        let teamsList = teams.map(async (team) => {
          let teamData: { id: string } = await BoardController.addListToBoard(
            boardId,
            team.name
          );
          return teamListIds.push({
            idInTrello: teamData.id,
            idInDB: team._id,
            name: team.name,
          });
        });
        await Promise.all(teamsList).then((res) =>
          logger.info({ removeWebhookSucced: "done" })
        );
      }
      return teamListIds;
    } catch (error) {
      logger.error({ createTeamListError: error });
    }
  }
};

export default DepartmentController;
