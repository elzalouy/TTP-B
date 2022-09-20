import fs from "fs";
import Config from "config";
import logger from "../../logger";
import { config } from "dotenv";
import { trelloApi } from "../services/trelloApi";
import { MemberType } from "../types/model/User";
import fetch, { RequestInit } from "node-fetch";
import { AttachmentResponse, TaskData } from "../types/model/tasks";
import {
  updateCardResponse,
  webhookUpdateInterface,
} from "../types/controller/Tasks";
import TaskController from "./task";
import { validateExtentions } from "../services/validation";
import TechMemberDB from "../dbCalls/techMember/techMember";
import Department from "../models/Department";
import Tasks from "../models/Task";
import { TrelloCardActionsQueue } from "../background/boardQueue";
import { createCardInBoardResponse } from "../types/controller/board";
import { io } from "../..";

config();
var FormData = require("form-data");

class BoardController {
  static async getBoardsInTrello() {
    return await BoardController.__getTrelloBoards();
  }

  static async getSingleBoardInfo(id: string, type: string) {
    return await BoardController.__singleBoardInfo(id, type);
  }

  static async getMembersInTrello() {
    return await BoardController.__getAllMembers();
  }

  static async addMemberToBoard(
    boardId: string,
    memberId: string,
    type: MemberType
  ) {
    return await BoardController.__addMember(boardId, memberId, type);
  }

  static async addListToBoard(boardId: string, listName: string) {
    return await BoardController.__addList(boardId, listName);
  }

  static async removeMemberFromBoard(boardId: string, memberId: string) {
    return await BoardController.__removeMember(boardId, memberId);
  }

  static async addListToArchieve(listId: string) {
    return await BoardController.__archieveList(listId);
  }

  static async createWebHook(idModel: string, route?: string) {
    return await BoardController.__addWebHook(idModel, route);
  }

  static async deleteBoard(id: string) {
    return await BoardController.__deleteBoard(id);
  }
  static async deleteCard(id: string) {
    return await BoardController.__deleteCard(id);
  }
  static async createCardInList(
    listId: string,
    cardName: string,
    description: string
  ) {
    return await BoardController.__createCard(listId, cardName, description);
  }
  static async downloadAttachment(cardId: string, attachmentId: string) {
    return await BoardController.__downloadAttachment(cardId, attachmentId);
  }
  static async createAttachmentOnCard(
    cardId: string,
    file: Express.Multer.File
  ) {
    return await BoardController.__createAttachment(cardId, file);
  }

  static async createNewBoard(name: string, color: string) {
    return await BoardController.__createNewBoard(name, color);
  }

  static async updateBoard(
    id: string,
    values: { name: string; color: string }
  ) {
    return await BoardController.__updateBoard(id, values);
  }

  static async removeWebhook(id: string) {
    return await BoardController.__removeWebhook(id);
  }

  static async moveTaskToDiffList(cardId: string, listId: string) {
    return await BoardController.__moveTaskToDiffList(cardId, listId);
  }
  static async updateBoardCard(data: webhookUpdateInterface) {
    return await BoardController.__updateBoardCard(data);
  }
  static async webhookUpdate(data: webhookUpdateInterface) {
    return await BoardController.__webhookUpdate(data);
  }
  static async __webhookUpdate(data: webhookUpdateInterface) {
    try {
      await BoardController.updateBoardCard(data);
    } catch (error) {
      logger.error({ webhookUpdateError: error });
    }
  }

  static async __moveTaskToDiffList(cardId: string, listId: string) {
    try {
      let moveTask = trelloApi(`cards/${cardId}?idList=${listId}&`);
      await fetch(moveTask, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      })
        .then((res) => {
          return res;
        })
        .catch((err) => logger.info("error in moving board", err));
    } catch (error) {
      logger.error({ moveTaskToDiffListError: error });
    }
  }

  static async __deleteBoard(id: string) {
    try {
      let removeBoard = trelloApi(`boards/${id}?response_type=token&`);
      logger.info({ removeBoard });
      return await fetch(removeBoard, {
        method: "DELETE",
      })
        .then((response) => {
          return response.text();
        })
        .catch((err) => logger.info("error in delete board", err));
    } catch (error) {
      logger.error({ deleteBoardError: error });
    }
  }

  static async __removeWebhook(id: string) {
    try {
      let webhookApi = trelloApi(`/webhooks/${id}&`);

      return await fetch(webhookApi, {
        method: "DELETE",
      });
    } catch (error) {
      logger.error({ removeWebhookError: error });
    }
  }
  static async __updateBoard(
    id: string,
    values: { name?: string; color?: string }
  ) {
    try {
      const { name, color } = values;
      let updateBoardApi = trelloApi(
        `boards/${id}/?name=${name}&prefs/background=${color}&`
      );
      let board: any = await fetch(updateBoardApi, {
        method: "PUT",
      }).catch((err) => {
        throw JSON.stringify({
          error: "TrelloError",
          message: "Failed to update trello name and color",
        });
      });
      return board.json();
    } catch (error) {
      logger.error({ updateBoardError: error });
    }
  }

  static async __createNewBoard(name: string, color: string) {
    try {
      let createBoardApi = trelloApi(
        `boards/?name=${name}&prefs_background=${color}&defaultLists=false&`
      );
      let board: any = await fetch(createBoardApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      let borderData = await board.json();
      return borderData;
    } catch (error) {
      logger.error({ createNewBoardError: error });
    }
  }

  static async __createAttachment(cardId: string, file: Express.Multer.File) {
    try {
      let formData = new FormData();
      formData.append("id", cardId);
      formData.append("name", file.filename);
      formData.append("mimeType", file.mimetype);
      formData.append("file", fs.readFileSync(file.path), {
        contentType: file.mimetype,
        name: "file",
        filename: file.filename,
      });
      let endpoint = trelloApi(`cards/${cardId}/attachments?`);
      let Response: AttachmentResponse;
      await fetch(endpoint, {
        method: "POST",
        body: formData,
      })
        .then(async (response) => {
          Response = JSON.parse(await response.text());
        })
        .catch((err) => {
          throw err;
        });
      return Response;
    } catch (error) {
      logger.error({ createAttachmentOnCardError: error });
    }
  }

  static async __deleteAtachment(cardId: string, attachmentId: string) {
    try {
      let endpoint = trelloApi(`cards/${cardId}/attachments/${attachmentId}?`);
      let response: any;
      await fetch(endpoint, { method: "DELETE" })
        .then(async (res) => {
          response = await res.json();
        })
        .catch((err) => {
          throw err;
        });
      return response;
    } catch (error) {
      logger.error({ deleteAttachmentFileError: error });
    }
  }

  static async __createCard(
    listId: string,
    cardName: string,
    description: string
  ) {
    try {
      let cardCreateApi = trelloApi(
        `cards?idList=${listId}&name=${cardName}&desc=${description}&attachments=true&`
      );
      let cardResult = await fetch(cardCreateApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      return cardResult.json();
    } catch (error) {
      logger.error({ createCardInListError: error });
    }
  }
  static async __deleteCard(id: string) {
    try {
      let deleteCartApi = trelloApi(`cards/${id}?`);
      let deleteRessult = await fetch(deleteCartApi, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      });
      return deleteRessult.json();
    } catch (error) {
      logger.error({ deleteTasksError: error });
    }
  }
  static async __getCardAttachments(cardId: string) {
    try {
      let api = trelloApi(`cards/${cardId}/attachments?`);
      let Response: AttachmentResponse[];
      await fetch(api).then(async (data) => {
        Response = JSON.parse(await data.text());
      });
      return Response;
    } catch (error) {
      logger.error({ getAttachmentsError: error });
    }
  }

  static async __addWebHook(idModel: string, route?: string) {
    try {
      let webhookUrl = `webhooks/?callbackURL=${
        route
          ? Config.get("Trello_Webhook_Callback_Url_Board")
          : Config.get("Trello_Webhook_Callback_Url")
      }&idModel=${idModel}&`;
      let webhookApi = trelloApi(webhookUrl);
      let webhookResult = await fetch(webhookApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      logger.info({ webhookResult: await webhookResult.json() });
      return webhookResult;
    } catch (error) {
      logger.error({ createWebHookError: error });
    }
  }

  static async __archieveList(listId: string) {
    try {
      let archeiveApi = trelloApi(`lists/${listId}/closed?value=true&`);
      let archieve = await fetch(archeiveApi, {
        method: "PUT",
      });
      return archieve.json();
    } catch (error) {
      logger.error({ archieveListError: error });
    }
  }

  static async __removeMember(boardId: string, memberId: string) {
    try {
      let removeApi = trelloApi(`boards/${boardId}/members/${memberId}?`);
      let remove = await fetch(removeApi, {
        method: "DELETE",
      });
      return remove.json();
    } catch (error) {
      logger.error({ removeMemberError: error });
    }
  }

  static async __addList(boardId: string, listName: string) {
    try {
      let addListApi = trelloApi(`lists?name=${listName}&idBoard=${boardId}&`);
      let newList = await fetch(addListApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }).catch((err) => {
        throw JSON.stringify({
          error: "TrelloError",
          message: "Failed to update trello lists",
        });
      });
      return newList.json();
    } catch (error) {
      logger.error({ addListError: error });
      return error;
    }
  }

  static async __addMember(
    boardId: string,
    memberId: string,
    type: MemberType
  ) {
    try {
      let addMemberApi = trelloApi(
        `boards/${boardId}/members/${memberId}?type=${type}&`
      );
      let newMember = await fetch(addMemberApi, {
        method: "PUT",
      });

      // logger.info({boardId,memberId,type,addMemberApi,newMember})
      return newMember.json();
    } catch (error) {
      logger.error({ addMemberError: error });
    }
  }

  static async __getAllMembers() {
    try {
      let boardApi = trelloApi(
        `organizations/${process.env.TEST_ORGANIZATION_ID}/members?`
      );
      let members = await fetch(boardApi, {
        method: "GET",
      });
      return members.json();
    } catch (error) {
      logger.error({ getTrelloMombersError: error });
    }
  }
  static async __getTrelloBoards() {
    try {
      let boardsApi = trelloApi(
        `organizations/${process.env.TEST_ORGANIZATION_ID}/boards?fields=id,name&`
      );
      let boards = await fetch(boardsApi, {
        method: "GET",
      });
      return boards.json();
    } catch (error) {
      logger.error({ getTrelloBoardError: error });
    }
  }

  static async __singleBoardInfo(id: string, type: string) {
    try {
      let boardApi = trelloApi(`boards/${id}/${type}?`);
      let board = await fetch(boardApi, {
        method: "GET",
      });
      return board.json();
    } catch (error) {
      logger.error({ singleBoardError: error });
    }
  }
  static async __downloadAttachment(cardId: string, attachmentId: string) {
    try {
      let api = trelloApi(
        `cards/${cardId}/attachments/${attachmentId}?fields=url&`
      );
      let Response: any = null;
      await fetch(api, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `OAuth oauth_consumer_key=${process.env.TRELLO_KEY}, oauth_token=${process.env.TRELLO_TOKEN}`,
        },
      }).then(async (response) => {
        Response = JSON.parse(await response.text());
      });
      return Response;
    } catch (error) {
      logger.error({ downloadAttachment: error });
    }
  }
  static async __updateCard(
    cardId: string,
    data: {
      name: string;
      desc: string;
      idBoard?: string;
      idList?: string;
      start?: string;
      deadline?: string;
    }
  ) {
    try {
      let params: RequestInit = {
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          desc: data.desc,
          idBoard: data.idBoard,
          idList: data.idList,
          due: data.deadline,
          start: data.start,
        }),
      };
      let api = trelloApi(`cards/${cardId}?`);
      let response = await fetch(api, params)
        .then(async (res) => {
          let result: updateCardResponse = await res.json();
          return result;
        })
        .catch((err) => {
          throw err;
        });
      return response;
    } catch (error) {
      logger.error({ __updateCardError: error });
    }
  }

  /**
   * updateBoardCard
   *
   * Update task with a new data coming from trello,
   * here is the actions handled here :-
   * - add Attachment
   * - change name
   * - description
   * - move task from list to list
   *
   * @param data webhook request data inserted with the webhook call.
   */
  static async __updateBoardCard(data: webhookUpdateInterface) {
    TrelloCardActionsQueue.push(async (cb) => {
      try {
        let type = data.action?.type;

        let action = data?.action?.display?.translationKey
          ? data?.action?.display?.translationKey
          : "";
        console.log({ type, action });
        console.log({ action: data.action.data.card });
        let task: TaskData = {
          name: data.action.data.card.name,
          listId: data.action.data.card.idList,
          boardId: data.action.data.board.id,
          cardId: data.action.data.card?.id,
        };
        let department = await Department.findOne({
          boardId: task.boardId,
        });

        if (
          type === "moveCardToBoard" &&
          action === "action_move_card_to_board"
        ) {
          task.boardId = data.action.data.board.id;
          task.listId = data.action.data.list.id;
          // move task to the new team
          let team = department.teams.find(
            (item) => item.listId === data.action.data.list.id
          );
          if (team) task.teamId = team._id;
          else {
            task.status = data.action.data.list.name;
          }
          // update task
          await TaskController.updateTaskByTrelloDB(task);
        }
        if (
          type === "updateCard" &&
          action !== "action_archived_card" &&
          action !== "action_sent_card_to_board"
        ) {
          if (action === "action_changed_a_due_date")
            task.deadline = new Date(data.action.data.card.due);
          if (action === "action_changed_a_start_date") {
            task.start = new Date(data.action.data.card.start);
          }
          if (action === "action_changed_description_of_card")
            task.description = data.action.data.card.desc;
          ``;
          if (action === "action_renamed_card")
            task.name = data.action.data.card.name;
          if (action === "action_move_card_from_list_to_list") {
            task.listId = data.action.data.listAfter?.id;
            task.lastMove = data.action.data.listBefore.name;
            task.lastMoveDate = new Date().toUTCString();
            let team = await department.teams.find(
              (item) => item.listId === data.action.data.listAfter.id
            );
            if (team) {
              task.teamId = team._id;
              task.status === "inProgress";
            } else {
              task.status = data.action.data.listAfter.name;
            }
          }
          await TaskController.updateTaskByTrelloDB(task);
        }
        // add attachment
        if (type === "addAttachmentToCard") {
          task.attachedFile = {
            trelloId: data.action.data?.attachment?.id,
            name: data.action.data?.attachment?.name,
            url: data.action.data.attachment?.url,
            // utils function to detect type from name.ext
            mimeType: validateExtentions(data.action.data?.attachment?.name),
          };
          await TaskController.updateTaskByTrelloDB(task);
        }
        if (type === "deleteAttachmentFromCard") {
          task.deleteFiles = {
            trelloId: data.action.data.attachment.id,
            name: data.action.data.attachment.name,
          };
          await TaskController.updateTaskByTrelloDB(task);
        }
        if (type === "updateCard" && action === "action_archived_card") {
          // archive, unArchive or delete
          let result = await TaskController.archiveTaskByTrelloDB(task, true);
        }
        if (type === "updateCard" && action === "action_sent_card_to_board") {
          console.log({ list: data.action.data.list });
          task.listId = data.action.data.list.id;
          let team = department.teams.find(
            (item) => item.listId === data.action.data.list.id
          );
          if (team) {
            task.status = "inProgress";
            task.teamId = team._id;
          } else task.status = data.action.data.list.name;
          await TaskController.archiveTaskByTrelloDB(task, false);
        }
        //delete
        if (type === "deleteCard") {
          let result = await TaskController.deleteTaskByTrelloDB(task);
        }
        cb(null, true);
      } catch (error: any) {
        logger.error({ updateBoardCardError: error });
        cb(error, null);
      }
    });
  }
  static async webhookUpdateBoard(data: createCardInBoardResponse) {
    TrelloCardActionsQueue.push(async (cb) => {
      try {
        let type = data.action.type;
        let action = data.action.display.translationKey;
        console.log({ action, type, data: { ...data.action.data } });
        if (type === "createCard" && action === "action_create_card") {
          let dep = await Department.findOne({
            boardId: data.action.data.board.id,
          });
          if (dep) {
            let team = dep.teams.find(
              (item) => item.listId === data.action.data.list.id
            );
            let task: TaskData = {
              cardId: data.action.data.card.id,
              listId: data.action.data.list.id,
              name: data.action.data.card.name,
              boardId: data.action.data.board.id,
              trelloShortUrl: `https://trello.com/c/${data.action.data.card.shortLink}`,
              deadline: null,
              start: new Date(),
            };
            if (team && team._id) {
              task = { ...task, teamId: team._id, status: "Tasks Board" };
            } else {
              task = {
                ...task,
                teamId: null,
                status: data.action.data.list.name,
              };
            }
            console.log({ newTask: task });
            await TaskController.createTaskByTrello(task);
          }
        }
        cb();
      } catch (error: any) {
        logger.error({ updateBoardCardError: error });
        cb(error);
      }
    });
  }
}
export default BoardController;
