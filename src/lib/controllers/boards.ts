import { MemberType } from "./../types/model/User";
import { trelloApi } from "./../services/trello/trelloApi";
import logger from "../../logger";
import fetch from "node-fetch";
import { config } from "dotenv";

config();

const BoardController = class BoardController {
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

  static async createCardInList(
    listId: string,
    cardName: string,
    file: string | Blob
  ) {
    return await BoardController.__createCard(listId, cardName, file);
  }

  static async createAttachmentOnCard(cardId: string, file: string) {
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

  static async __deleteBoard(id: string) {
    try {
      let removeBoard = trelloApi(`boards/${id}&`);

      return await fetch(removeBoard, {
        method: "DELETE",
      })
        .then((res) => logger.info("delete board done"))
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

  //todo fix attachment file binary
  static async __createAttachment(cardId: string, file: string) {
    try {
      logger.info({ file });
      let attachmentApi = trelloApi(
        `cards/${cardId}/attachments?file=${file}&`
      );

      let attachment = await fetch(attachmentApi, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      });
      return attachment.json();
    } catch (error) {
      logger.error({ createAttachmentOnCardError: error });
    }
  }

  static async __createCard(
    listId: string,
    cardName: string,
    file: string | Blob
  ) {
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
      return cardResult.json();
    } catch (error) {
      logger.error({ createCardInListError: error });
    }
  }

  static async __addWebHook(idModel: string) {
    try {
      let webhookApi = trelloApi(
        `/webhooks/?callbackURL=${process.env.TRELLO_WEBHOOK_CALLBAKC_URL}&idModel=${idModel}&`
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
        `organizations/${process.env.ORGANIZATION_ID}/members?`
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
        `organizations/${process.env.ORGANIZATION_ID}/boards?fields=id,name&`
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
};

export default BoardController;
