import fs from "fs";
import Config from "config";
import logger from "../../logger";
import { config } from "dotenv";
import { trelloApi, trelloApiWithUrl } from "../services/trelloApi";
import { MemberType } from "../types/model/User";
import fetch, { RequestInit, Response } from "node-fetch";
import { AttachmentResponse, TaskData } from "../types/model/tasks";
import { editCardParams, updateCardResponse } from "../types/controller/trello";
import { ProjectData, ProjectInfo } from "../types/model/Project";
import { IDepartment } from "../types/model/Department";

config();
var FormData = require("form-data");

class TrelloActionsController {
  static async getBoardsInTrello() {
    return await TrelloActionsController.__getTrelloBoards();
  }

  static async getSingleBoardInfo(id: string) {
    return await TrelloActionsController.__singleBoardInfo(id);
  }

  static async getMembersInTrello() {
    return await TrelloActionsController.__getAllMembers();
  }

  static async addMemberToBoard(
    boardId: string,
    memberId: string,
    type: MemberType
  ) {
    return await TrelloActionsController.__addMember(boardId, memberId, type);
  }

  static async addListToBoard(boardId: string, listName: string) {
    return await TrelloActionsController.__addList(boardId, listName);
  }

  static async removeMemberFromBoard(boardId: string, memberId: string) {
    return await TrelloActionsController.__removeMember(boardId, memberId);
  }

  static async addListToArchieve(listId: string) {
    return await TrelloActionsController.__archieveList(listId);
  }

  static async createWebHook(idModel: string, urlInConfig: string) {
    return await TrelloActionsController.__addWebHook(idModel, urlInConfig);
  }

  static async deleteBoard(id: string) {
    return await TrelloActionsController.__deleteBoard(id);
  }
  static async deleteCard(id: string) {
    return await TrelloActionsController.__deleteCard(id);
  }
  static async createCardInList(data: TaskData) {
    return await TrelloActionsController.__createCard(data);
  }
  static async downloadAttachment(cardId: string, attachmentId: string) {
    return await TrelloActionsController.__downloadAttachment(
      cardId,
      attachmentId
    );
  }
  static async createAttachmentOnCard(
    cardId: string,
    file: Express.Multer.File
  ) {
    return await TrelloActionsController.__createAttachment(cardId, file);
  }

  static async createNewBoard(name: string, color: string) {
    return await TrelloActionsController.__createNewBoard(name, color);
  }

  static async updateBoard(
    id: string,
    values: { name: string; color: string }
  ) {
    return await TrelloActionsController.__updateBoard(id, values);
  }

  static async removeWebhook(id: string) {
    return await TrelloActionsController.__removeWebhook(id);
  }

  static async moveTaskToDiffList(
    cardId: string,
    listId: string,
    due?: string
  ) {
    return await TrelloActionsController.__moveTaskToDiffList(
      cardId,
      listId,
      due ?? undefined
    );
  }

  static async __moveTaskToDiffList(
    cardId: string,
    listId: string,
    due?: string
  ) {
    try {
      let url = `cards/${cardId}/?idList=${listId}&`;
      if (due) url = `${url}due=${new Date(due).getTime()}&`;
      let moveTask = trelloApi(url);
      let result = await fetch(moveTask, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (res) => {
          return res.json();
        })
        .then((value) => {
          return value;
        })
        .catch((err) => logger.info("error in moving board", err));
      return result;
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
        logger.error({ err });
        return {
          error: "TrelloError",
          message: "Failed to update trello name and color",
        };
      });
      return board.json();
    } catch (error) {
      logger.error({ updateBoardError: error });
    }
  }

  static async __createNewBoard(name: string, color: string) {
    try {
      let createBoardApi = trelloApi(
        `boards/?name=${name}&prefs_background=${color}&defaultLists=false&idOrganization=${Config.get(
          "trelloOrgId"
        )}&`
      );
      let board: any = await fetch(createBoardApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      return await board.json();
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
          logger.error(err);
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
          logger.error({ err });
          return err;
        });
      return response;
    } catch (error) {
      logger.error({ deleteAttachmentFileError: error });
    }
  }

  static async __createProject(listId: string, data: ProjectData) {
    try {
      let response: any;
      let url = `cards/?idList=${listId}&name=${data.name}&`;
      if (data.projectDeadline)
        url = `${url}due=${new Date(data.projectDeadline).getTime()}&`;
      if (data.startDate)
        url = `${url}start=${new Date(data.startDate).getTime()}`;
      url = `${url}&attachments=true&`;
      let cardCreateApi = trelloApi(url);
      let cardResult = await fetch(cardCreateApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }).then((res) => {
        response = res;
        return res;
      });
      return await response.json();
    } catch (error) {
      logger.error({ createProjectCardError: error });
    }
  }

  static async __createCard(data: TaskData) {
    try {
      let url = `cards/?idList=${
        data.teamListId ?? data.listId
      }&name=${encodeURIComponent(data.name)}&desc=${encodeURIComponent(
        data.description
      )}&`;
      if (data.start) url = `${url}start=${new Date(data.start).getTime()}&`;
      if (data.deadline)
        url = `${url}due=${new Date(data.deadline).getTime()}&`;
      let cardCreateApi = trelloApi(url);
      let cardResult = await fetch(cardCreateApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      return await cardResult.json();
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
      return await deleteRessult.json();
    } catch (error) {
      logger.error({ deleteTasksError: error });
    }
  }
  static async __getCardsInBoard(boardId: string) {
    try {
      let url = trelloApi(`boards/${boardId}/cards/all?`);
      let result = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      return await result.json();
    } catch (error) {
      logger.error({ getCardsInBoardError: error });
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
      let route = "webhooks";
      let params = `idModel=${idModel}&callbackURL=${Config.get(urlInConfig)}`;
      let webhookApi = trelloApiWithUrl(route, params);
      fetch(webhookApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (res: Response) => {
          return res.text();
        })
        .catch((err) => console.log({ err }));
    } catch (error) {
      logger.error({ createWebHookError: error });
    }
  }

  static async __getAllWebWebHook(idModel: string, urlInConfig: string) {
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

  static async __getBoardLists(boardId: string) {
    try {
      let url = await trelloApi(`boards/${boardId}/lists?`);
      let lists = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      return await lists.json();
    } catch (error) {
      logger.error({ getBoardListsError: error });
    }
  }

  static async __archieveList(listId: string) {
    try {
      let archeiveApi = trelloApi(`lists/${listId}/closed?value=true&`);
      let archieve = await fetch(archeiveApi, {
        method: "PUT",
      });
      return await archieve.json();
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
      return await remove.json();
    } catch (error) {
      logger.error({ removeMemberError: error });
    }
  }

  static async __addList(boardId: string, listName: string) {
    try {
      let result: any;
      let addListApi = trelloApi(`lists?name=${listName}&idBoard=${boardId}&`);
      await fetch(addListApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
        .then(async (res: any) => {
          result = await res.json();
        })
        .catch((err: any) => {
          logger.error({ err });
          return err;
        });
      return result;
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
      return await newMember.json();
    } catch (error) {
      logger.error({ addMemberError: error });
    }
  }

  static async __getAllMembers() {
    try {
      let boardApi = trelloApi(
        `organizations/${Config.get("trelloOrgId")}/memberships?member=true&`
      );
      let members = await fetch(boardApi, {
        method: "GET",
      });
      return await members.json();
    } catch (error) {
      logger.error({ getTrelloMombersError: error });
    }
  }

  static async __getTrelloBoards() {
    try {
      let boardsApi = trelloApi(
        `organizations/${Config.get("trelloOrgId")}/boards?fields=id,name&`
      );
      let boards = await fetch(boardsApi, {
        method: "GET",
      });
      return await boards.json();
    } catch (error) {
      logger.error({ getTrelloBoardError: error });
    }
  }

  static async __singleBoardInfo(id: string) {
    try {
      let boardApi = trelloApi(`boards/${id}?`);
      let board = await fetch(boardApi, {
        method: "GET",
      });
      return await board.json();
    } catch (error) {
      logger.error({ singleBoardError: error });
    }
  }

  static async __moveAllCardsInList(
    id: string,
    idBoard: string,
    idList: string
  ) {
    try {
      let boardApi = trelloApi(
        `lists/${id}/moveAllCards?idBoard=${idBoard}&idList=${idList}&`
      );
      let result = await fetch(boardApi, {
        method: "POST",
      });
      return await result.json();
    } catch (error) {
      logger.error({ moveAllCardsInListsError: error });
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
          Authorization: `OAuth oauth_consumer_key=${Config.get(
            "trelloKey"
          )}, oauth_token=${Config.get("trelloToken")}`,
        },
      }).then(async (response) => {
        Response = await response.json();
      });
      return Response;
    } catch (error) {
      logger.error({ downloadAttachment: error });
    }
  }

  static async __updateCard({ cardId, data }: editCardParams) {
    try {
      let body = {
        name: encodeURIComponent(data.name),
        desc: encodeURIComponent(data.desc),
        due: data.due,
        start: data.start,
        idList: data.idList,
        idBoard: data.idBoard,
      };
      logger.info({ body });

      let params: RequestInit = {
        method: "PUT",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      };
      let api = trelloApi(`cards/${cardId}?`);
      let response: any;
      await fetch(api, params)
        .then(async (res) => {
          response = await res.json();
        })
        .catch((err) => {
          logger.error({ err });
          return err;
        });
      return response;
    } catch (error) {
      logger.error({ __updateCardError: error });
    }
  }
}

export default TrelloActionsController;
