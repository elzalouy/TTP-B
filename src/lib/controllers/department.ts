import logger from "../../logger";
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

  static async deleteDepartment(id: string) {
    return await DepartmentController.__deleteDepartmentData(id);
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

  static async __deleteDepartmentData(id: string) {
    try {
      let deleteDepartment = await super.deleteDepartmentDB(id);
      return deleteDepartment;
    } catch (error) {
      logger.error({ deleteDepartmentError: error });
    }
  }

  static async __updateDepartmentData(data: UpdateDepartment) {
    try {
      logger.info({data})
      let depUpdate:any
      //todo update name and color
      if (data.name && data.color) {
        let value = {
          name: data.name,
          color: data.color,
        };
        await BoardController.updateBoard(data.boardId, value);
         depUpdate = await super.updatedbDepartment(data);
      }
      //todo make mainBoard or not
      
      // if not null then there is an action needed
      if (data.mainBoard) {
        // if false => remove the webhook
        if (!data.mainBoard) {
          let hookRemove = data.teams.map(async (id) => {
            return await BoardController.removeWebhook(id);
          });

          Promise.all(hookRemove).then((res) =>
            logger.info({ removeWebhookSucced: "done" })
          );
        }
        // if true => create the webhook
        if (data.mainBoard) {
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
          BoardController.addListToArchieve(id);
          // remove webhook
          return await BoardController.removeWebhook(id);
        });
        Promise.all(hookListremove).then((res) =>
          logger.info({ removeListAndWebhookSucced: "done" })
        );

        // remove team
        depUpdate = super.updateNestedRecordDepDB(data._id, {
          $pull: {
            teamsId: {
              idInTrello: { $in: data.removeTeam },
            },
          },
        });
      }

      // If add team
      if (data.addTeam) {
        let teamListIds: { idInTrello: string; idInDB: any }[] = await DepartmentController.__createTeamWebhookAndList(data.addTeam,data.boardId,data.mainBoard);

         // add team
         depUpdate = super.updateNestedRecordDepDB(data._id, {
          $push: {
            teamsId: {
              idInTrello: { $each: teamListIds },
            },
          },
        });
      }
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

      // create board
      let boardData: any = await BoardController.createNewBoard(
        data.name,
        data.color
      );
        logger.info({boardData})
      boardId = boardData.id;
      data = {
        name: data.name,
        color: data.color,
        boardId,
      };

      let departmentCreate = await super.createdbDepartment(data);

      // create main list on board
      let done: { id: string } = await BoardController.addListToBoard(
        boardId,
        "done"
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
      let teamListIds: { idInTrello: string; idInDB: any }[] = await DepartmentController.__createTeamWebhookAndList(teams,boardId,mainBoard);

      let defaultList: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Tasks Board"
      );
      defaultListId = defaultList.id;

      let unClear: { id: string } = await BoardController.addListToBoard(
        boardId,
        "Unclear brief"
      );
      notClearListId = unClear.id;

      let cancel: { id: string } = await BoardController.addListToBoard(
        boardId,
        "cancel"
      );
      canceldListId = cancel.id;

      // create webhook for list
      const listId: string[] = [
        defaultListId,
        sharedListID,
        doneListId,
        reviewListId,
        notClearListId,
        canceldListId,
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

      // update team record with the department id
      await TechMemberDB.updateTechMembersDB({ ids, departmentId: departId });

      // update my department with the ids for the team in trello
      return await super.updatedbDepartment({ _id: departId, ...data });
    } catch (error) {
      logger.error({ createTeamListError: error });
    }
  }

  // This create list for team in trello board and create webhook for that list if it was the mainboard
  static async __createTeamWebhookAndList(teams: { name: string; _id: string }[],boardId:string,mainBoard:boolean) {
    try {
      // create list for the team
      let teamListIds: { idInTrello: string; idInDB: any }[] = [];
      if (teams) {
        let teamsList = teams.map( async (team) => {
          // create team list on board
          let teamData: { id: string } =  await BoardController.addListToBoard(
            boardId,
            team.name
          );
          if (mainBoard) {
            // create webhook for team list if it was the main board
             BoardController.createWebHook(teamData.id);
          }
          logger.info({ teamData: teamData.id });
          return teamListIds.push({ idInTrello: teamData.id, idInDB: team._id });
        });

        await Promise.all(teamsList);
      }

      return teamListIds
    } catch (error) {
      logger.error({ createTeamListError: error });
    }
  }
};

export default DepartmentController;
