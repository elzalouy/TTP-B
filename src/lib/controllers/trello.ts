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
import Department from "../models/Department";
import { createCardInBoardResponse } from "../types/controller/board";
import { io } from "../..";
import { taskRoutesQueue } from "../background/routes/tasks.Route.Queue";

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

  static async createWebHook(idModel: string, urlInConfig: string) {
    return await BoardController.__addWebHook(idModel, urlInConfig);
  }

  static async deleteBoard(id: string) {
    return await BoardController.__deleteBoard(id);
  }
  static async deleteCard(id: string) {
    return await BoardController.__deleteCard(id);
  }
  static async createCardInList(data: TaskData) {
    return await BoardController.__createCard(data);
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
      let moveTask = trelloApi(`cards/${cardId}/?idList=${listId}&`);
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

  static async __createCard(data: TaskData) {
    try {
      let url = `cards/?idList=${data.listId}&name=${data.name}&desc=${data.description}&`;
      if (data.deadline)
        url = `${url}due=${new Date(data.deadline).getTime()}&start=${new Date(
          data.start
        ).getTime()}&`;
      url = `${url}attachments=true&`;
      let cardCreateApi = trelloApi(url);
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

  static async __addWebHook(idModel: string, urlInConfig: string) {
    try {
      let webhookUrl = `webhooks/?idModel=${idModel}&callbackURL=${Config.get(
        urlInConfig
      )}&`;
      let webhookApi = trelloApi(webhookUrl);
      let webhookResult = await fetch(webhookApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
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
      due?: string;
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
          due: data.due,
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
   * - add/delete Attachment
   * - change name, description, due data, start date
   * - move task from list to list
   * - move task from board to board
   * - remove task
   * @param data webhook request data inserted with the webhook call.
   */
  static async __updateBoardCard(data: webhookUpdateInterface) {
    taskRoutesQueue.push(async (cb) => {
      try {
        if (data.action && data?.action?.data) {
          let type = data.action?.type;
          let action = data?.action?.display?.translationKey
            ? data?.action?.display?.translationKey
            : "";
          let currentTask = await TaskController.getOneTaskBy({
            cardId: data?.action?.data?.card?.id,
          });
          console.log({ updateCardData: data.action.data });
          if (data?.action?.data) {
            let task: TaskData = {
              name: data.action.data.card.name,
              boardId: data.action.data.board.id,
              cardId: data.action.data.card.id,
              deadline:
                data.action.data.card.due !== undefined
                  ? data.action?.data?.card?.due === null
                    ? null
                    : new Date(data.action.data.card.due)
                  : currentTask.deadline,
              start: data.action.data.card.start
                ? new Date(data.action.data.card.start)
                : currentTask.start
                ? currentTask.start
                : undefined,
              description: data.action.data.card.desc
                ? data.action.data.card.desc
                : currentTask.description
                ? currentTask.description
                : undefined,
            };
            let department = await Department.findOne({
              boardId: task.boardId,
            });
            let team = department.teams.find(
              (item) => item.listId === data.action.data.card.idList
            );
            // delete
            if (type === "deleteCard") {
              return await TaskController.deleteTaskByTrelloDB(task);
            }
            //  move
            if (data.action.data.listAfter) {
              task.lastMove = data.action.data.listBefore.name;
              task.lastMoveDate = new Date().toUTCString();
              if (team) {
                task.teamId = team._id;
                let teamBefore = department.teams.find(
                  (item) => item.listId === currentTask.listId
                );
                if (!teamBefore) {
                  task.listId = currentTask.listId;
                  task.status = currentTask.status;
                }
              } else {
                task.listId = data.action.data.listAfter.id;
                task.status = data.action.data.listAfter.name;
                task.teamId = currentTask?.teamId
                  ? currentTask.teamId.toString()
                  : null;
              }
            }

            // add or delete files
            if (data.action.data.attachment) {
              if (type === "deleteAttachmentFromCard") {
                task.deleteFiles = {
                  trelloId: data.action.data.attachment.id,
                  name: data.action.data.attachment.name,
                };
              }
              if (type === "addAttachmentToCard") {
                task.attachedFile = {
                  trelloId: data.action.data?.attachment?.id,
                  name: data.action.data?.attachment?.name,
                  url: data.action.data.attachment?.url,
                  mimeType: validateExtentions(
                    data.action.data?.attachment?.name
                  ),
                };
              }
            }

            // archeive
            if (type === "updateCard" && action === "action_archived_card") {
              task.listId = null;
              task.status = "Archived";
            }

            // move to board
            if (action === "action_move_card_to_board") {
              // set the list id, and boardId, and if the list is for a team, set the team id and keep the status as the old one
              // if the list id isn't for a team change the status and not the team id
              if (team) {
                task.teamId = team._id;
                task.status = "Tasks Board";
              } else task.status = data.action.data.list.name;
              // un-archeive
            }
            if (action === "action_sent_card_to_board" && team)
              task.status = "Tasks Board";

            return await TaskController.updateTaskByTrelloDB(task);
            cb(null, true);
          }
        }
      } catch (error: any) {
        logger.error({ updateBoardCardError: error });
        cb(error, null);
      }
    });
  }
  static async webhookUpdateBoard(data: createCardInBoardResponse) {
    taskRoutesQueue.push(async (cb) => {
      try {
        if (data?.action?.data) {
          let type = data?.action?.type;
          let action = data?.action?.display?.translationKey;
          if (type === "createCard" && action === "action_create_card") {
            let existed = await TaskController.getOneTaskBy({
              cardId: data?.action?.data?.card?.id,
            });
            if (!existed) {
              let dep = await Department.findOne({
                boardId: data?.action?.data?.board?.id,
              });
              if (dep) {
                let team = dep.teams.find(
                  (item) => item.listId === data?.action?.data?.list?.id
                );
                let task: TaskData = {
                  cardId: data.action.data.card.id,
                  name: data.action.data.card.name,
                  boardId: data.action.data.board.id,
                  trelloShortUrl: `https://trello.com/c/${data.action.data.card.shortLink}`,
                  deadline: data.action.data.card.due
                    ? new Date(data.action.data.card.due)
                    : undefined,
                  start: data.action.data.card.start
                    ? new Date(data.action.data.card.start)
                    : undefined,
                };
                if (team && team._id) {
                  task = {
                    ...task,
                    teamId: team._id,
                    status: "inProgress",
                    listId: dep.lists.find((item) => item.name === "inProgress")
                      .listId,
                  };
                } else {
                  task = {
                    ...task,
                    status: data.action.data.list.name,
                    listId: data.action.data.list.id,
                    teamId: null,
                  };
                }
                await TaskController.createTaskByTrello(task);
              }
            }
            cb();
          }
        }
      } catch (error: any) {
        logger.error({ updateBoardError: error });
        cb(error);
      }
    });
  }
}
export default BoardController;
