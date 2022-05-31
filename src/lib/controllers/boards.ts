import { MemberType } from "./../types/model/User";
import { trelloApi } from "./../services/trello/trelloApi";
import logger from "../../logger";
import fetch from "node-fetch";
import Config from "config";
import { config } from "dotenv";
import fs from "fs";
var FormData = require("form-data");
config();

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

  static async createWebHook(idModel: string) {
    return await BoardController.__addWebHook(idModel);
  }

  static async deleteBoard(id: string) {
    return await BoardController.__deleteBoard(id);
  }
  static async deleteCard(id: string) {
    return await BoardController.__deleteCard(id);
  }
  static async createCardInList(listId: string, cardName: string) {
    return await BoardController.__createCard(listId, cardName);
  }

  static async createAttachmentOnCard(
    cardId: string,
    filePath: string,
    fileName: string
  ) {
    return await BoardController.__createAttachment(cardId, filePath, fileName);
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

  static async __moveTaskToDiffList(cardId: string, listId: string) {
    try {
      let moveTask = trelloApi(`cards/${cardId}?idList=${listId}&`);
      return await fetch(moveTask, {
        method: "PUT",
        headers: {
          Accept: "application/json",
        },
      })
        .then((res) => logger.info("move board done", res))
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
          console.log(`Response: ${response.status} ${response.statusText}`);
          return response.text();
        })
        .then((text) => console.log(text))
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
      let borderData = board.json();
      logger.info({ borderData, createBoardApi });
      return borderData;
    } catch (error) {
      logger.error({ createNewBoardError: error });
    }
  }

  static async __createAttachment(
    cardId: string,
    filePath: string,
    fileName: string
  ) {
    try {
      let bufferFile: Buffer;
      console.log(filePath, fileName);
      await fs.readFile(filePath, (error, data) => {
        if (error) throw error;
        bufferFile = data;
      });
      if (bufferFile) {
        let formData = new FormData();
        formData.append("name", fileName);
        formData.append("file", bufferFile?.toString("base64"));
        let endpoint = trelloApi(`cards/${cardId}/attachments`);
        let response = await fetch(endpoint, {
          method: "POST",
          headers: { Accept: "multipart/form-data" },
          body: JSON.stringify(formData),
        });
        console.log(response.json());
        if ([200, 201].includes(response.status) && response.body)
          return response.json();
      }
      throw "File not existed";
    } catch (error) {
      logger.error({ createAttachmentOnCardError: error });
    }
  }
  static async __createCard(listId: string, cardName: string) {
    try {
      let cardCreateApi = trelloApi(
        `cards?idList=${listId}&name=${cardName}&attachments=true&`
      );
      let cardResult = await fetch(cardCreateApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      if (cardResult.status !== 200 && cardResult.status !== 201) {
        console.log(cardResult);
      }
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
  static async __addWebHook(idModel: string) {
    try {
      let webhookApi = trelloApi(
        `/webhooks/?callbackURL=${Config.get(
          "Trello_Webhook_Callback_Url"
        )}&idModel=${idModel}&`
      );

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
      });

      return newList.json();
    } catch (error) {
      logger.error({ addListError: error });
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
      let boardApi = await trelloApi(`boards/${id}/${type}?`);
      let board = await fetch(boardApi, {
        method: "GET",
      });
      return board.json();
    } catch (error) {
      logger.error({ singleBoardError: error });
    }
  }
}

export default BoardController;
