import logger from "../../logger";
import Procedures from "../db/procedures";
import DepartmentBD from "../dbCalls/department/department";
import TechMemberDB from "../dbCalls/techMember/techMember";
import { UpdateDepartment, DepartmentData } from "../types/model/Department";
import BoardController from "./boards";

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

  static async getDepartments(data: object) {
    return await DepartmentController.__getDepartmentsData(data);
  }

  static async __getDepartmentsData(data: object) {
    try {
      let departments = await super.getDepartmentsData(data);
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
        logger.info("third step");

        Promise.all(hookRemove).then((res) =>
          logger.info({ removeWebhookSucced: "done" })
        );
      }
      logger.info({ boardId: myDepartment?.boardId, myDepartment });
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
      if (data.mainBoard !== undefined && data.teams) {
        logger.info("second step");

        // if false => remove the webhook
        if (!data.mainBoard) {
          let hookRemove = data.teams.map(async (id) => {
            return await BoardController.removeWebhook(id);
          });
          logger.info("third step");

          Promise.all(hookRemove).then((res) =>
            logger.info({ removeWebhookSucced: "done" })
          );
        }
        // if true => create the webhook
        if (data.mainBoard) {
          logger.info("fourth step");

          let hookAdd = data.teams.map(async (id) => {
            return await BoardController.createWebHook(id);
          });

          Promise.all(hookAdd).then((res) =>
            logger.info({ addWebhookSucced: "done" })
          );
        }
      }

      //todo add team or remove team
      // if remove team
      if (data.removeTeam) {
        let hookListremove = data.removeTeam.map(async (id) => {
          // remove team list
          await BoardController.addListToArchieve(id);
          // remove webhook
          return await BoardController.removeWebhook(id);
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
          await DepartmentController.__createTeamWebhookAndList(
            data.addTeam,
            data.boardId,
            data.mainBoard
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
      let teams = data.teams;
      let mainBoard = data.mainBoard;
      // define the board and list variable
      let boardId: string = "";
      let defaultListId: string = "";
      let sharedListID: string = "";
      let doneListId: string = "";
      let reviewListId: string = "";
      let notClearListId: string = "";
      let canceldListId: string = "";
      let inProgressListId: string = "";
      // create board
      let boardData: any = await BoardController.createNewBoard(
        data.name,
        data.color
      );
      boardId = boardData.id;
      data = {
        name: data.name,
        color: data.color,
        boardId,
      };

      let departmentCreate = await super.createdbDepartment(data);

      // create main list on board

      let inprogress: { id: string } = await BoardController.addListToBoard(
        boardId,
        "inProgress"
      );
      inProgressListId = inprogress.id;

      let cancel: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Cancled"
      );
      canceldListId = cancel.id;

      let unClear: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Not Clear"
      );
      notClearListId = unClear.id;

      let done: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Done"
      );
      doneListId = done.id;

      let shared: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Shared"
      );
      sharedListID = shared.id;

      let review: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Review"
      );
      reviewListId = review.id;

      // create list and webhook for the team
      let teamListIds: { idInTrello: string; idInDB: any }[] =
        await DepartmentController.__createTeamWebhookAndList(
          teams,
          boardId,
          mainBoard
        );

      let defaultList: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Tasks Board"
      );
      defaultListId = defaultList.id;

      // create webhook for list
      const listId: string[] = [
        defaultListId,
        sharedListID,
        doneListId,
        reviewListId,
        notClearListId,
        canceldListId,
        inProgressListId,
      ];

      let webhookCreate = listId.map(async (id) => {
        return await BoardController.createWebHook(id);
      });
      Promise.all(webhookCreate).then((res) =>
        logger.info({ webhookCreateResult: "webhook done" })
      );
      data = {
        defaultListId,
        sharedListID,
        doneListId,
        reviewListId,
        notClearListId,
        canceldListId,
        inProgressListId,
        teamsId: teamListIds,
      };
      let department = await DepartmentController.__createTeamList(
        teams,
        departmentCreate._id,
        data
      );

      if (!department) {
        return null;
      }
      return department;
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

  static async __createTeamWebhookAndList(
    teams: { name: string; _id: string }[],
    boardId: string,
    mainBoard: boolean
  ) {
    try {
      let teamListIds: { idInTrello: string; idInDB: any }[] = [];
      if (teams) {
        let teamsList = teams.map(async (team) => {
          let teamData: { id: string } = await BoardController.addListToBoard(
            boardId,
            team.name
          );
          if (mainBoard) {
            BoardController.createWebHook(teamData.id);
          }
          return teamListIds.push({
            idInTrello: teamData.id,
            idInDB: team._id,
          });
        });

        await Promise.all(teamsList).then((res) =>
          logger.info({ removeWebhookSucced: "done" })
        );
      }
      logger.info({ teamListIds });
      return teamListIds;
    } catch (error) {
      logger.error({ createTeamListError: error });
    }
  }
};

export default DepartmentController;
