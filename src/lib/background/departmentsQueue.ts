import queue from "queue";
import logger from "../../logger";
import BoardController from "../controllers/trello";
import DepartmentController from "../controllers/department";
import { DepartmentData, DepartmentInfo } from "../types/model/Department";
import { io } from "../server";

import {
  createBoardResponse,
  createListResponse,
} from "../types/controller/board";
import Department from "../models/Department";
export const DepartmentQueue = queue({ results: [] });

/**
 * CreateOne
 *
 * It's a function for pushing a task to the Department Queue for being processed.
 * it takes a turn on the processing queue of this worker.
 * Once the process is done it will return a callback with two paramters error and returned data.
 * If an error just hapenned, it will emit an event to the client using the websocket connection and cancel the create request.
 * @param department DepartmentData
 */
export const createOneJob = (
  department: DepartmentInfo,
  teams: { name: string; _id: any }[]
) => {
  DepartmentQueue.push(async (cb) => {
    try {
      // b- create department based the on created board id

      if (department._id) {
        let defaultListId: string = "";
        let sharedListID: string = "";
        let doneListId: string = "";
        let reviewListId: string = "";
        let notClearListId: string = "";
        let canceldListId: string = "";
        let inProgressListId: string = "";
        // // create board
        let inprogress: createListResponse =
          await BoardController.addListToBoard(
            department.boardId,
            "inProgress"
          );
        console.log(inprogress);
        inProgressListId = inprogress.id;

        let cancel: createListResponse = await BoardController.addListToBoard(
          department.boardId,
          "Cancled"
        );
        canceldListId = cancel.id;

        let unClear: createListResponse = await BoardController.addListToBoard(
          department.boardId,
          "Not Clear"
        );
        notClearListId = unClear.id;

        let done: createListResponse = await BoardController.addListToBoard(
          department.boardId,
          "Done"
        );
        doneListId = done.id;

        let shared: createListResponse = await BoardController.addListToBoard(
          department.boardId,
          "Shared"
        );
        sharedListID = shared.id;

        let review: createListResponse = await BoardController.addListToBoard(
          department.boardId,
          "Review"
        );
        reviewListId = review.id;

        let defaultList: createListResponse =
          await BoardController.addListToBoard(
            department.boardId,
            "Tasks Board"
          );
        defaultListId = defaultList.id;

        // // create list and webhook for the team
        let teamListIds: { idInTrello: string; idInDB: any }[] =
          await DepartmentController.__createTeamWebhookAndList(
            teams,
            department.boardId,
            department.mainBoard
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
        let data = {
          defaultListId,
          sharedListID,
          doneListId,
          reviewListId,
          notClearListId,
          canceldListId,
          inProgressListId,
          teamsId: teamListIds,
        };
        let result = await DepartmentController.__createTeamList(
          teams,
          department._id,
          data
        );
        if (!department || !result) {
          io.sockets.emit("new-department-error", { id: department._id });
          await BoardController.deleteBoard(department.boardId);
          await DepartmentController.deleteDepartment(department._id);
          await cb(new Error("Board was not created"), null);
        }
        io.sockets.emit("new-department", result);
        cb(null, result);
      }
    } catch (error) {
      // socket event should emit here
      logger.error({ createDepartmentJobError: error });
    }
  });
};
