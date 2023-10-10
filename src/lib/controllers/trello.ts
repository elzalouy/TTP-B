import fs from "fs";
import Config from "config";
import logger from "../../logger";
import { config } from "dotenv";
import { trelloApi, trelloApiWithUrl } from "../services/trelloApi";
import { MemberType } from "../types/model/User";
import fetch, { RequestInit, Response } from "node-fetch";
import {
  AttachmentResponse,
  Movement,
  TaskData,
  TaskInfo,
} from "../types/model/tasks";
import {
  Board,
  Card,
  CheckListItem,
  List,
  TrelloAction,
  editCardParams,
  updateCardResponse,
} from "../types/controller/trello";
import { ProjectData, ProjectInfo } from "../types/model/Project";
import { IDepartment, ITeam, ListTypes } from "../types/model/Department";
import _ from "lodash";
import { ITrelloActionsOfSnapshot } from "../types/model/TrelloActionsSnapshots";
import Tasks from "../models/Task";
import { ObjectId } from "mongodb";

// adding comment to merge
config();
var FormData = require("form-data");

class TrelloController {
  static async getBoardsInTrello(filter: string) {
    return await TrelloController.__getTrelloBoards(filter);
  }

  static async getSingleBoardInfo(id: string) {
    return await TrelloController.__singleBoardInfo(id);
  }

  static async getMembersInTrello() {
    return await TrelloController.__getAllMembers();
  }

  static async addMemberToBoard(
    boardId: string,
    memberId: string,
    type: MemberType
  ) {
    return await TrelloController.__addMember(boardId, memberId, type);
  }

  static async addListToBoard(boardId: string, listName: string) {
    return await TrelloController.__addList(boardId, listName);
  }

  static async removeMemberFromBoard(boardId: string, memberId: string) {
    return await TrelloController.__removeMember(boardId, memberId);
  }

  static async addListToArchieve(listId: string) {
    return await TrelloController.__archieveList(listId);
  }

  static async createWebHook(idModel: string, urlInConfig: string) {
    return await TrelloController.__addWebHook(idModel, urlInConfig);
  }

  static async deleteBoard(id: string) {
    return await TrelloController.__deleteBoard(id);
  }
  static async deleteCard(id: string) {
    return await TrelloController.__deleteCard(id);
  }
  static async createCardInList(data: TaskData) {
    return await TrelloController.__createCard(data);
  }
  static async downloadAttachment(cardId: string, attachmentId: string) {
    return await TrelloController.__downloadAttachment(cardId, attachmentId);
  }
  static async createAttachmentOnCard(
    cardId: string,
    file: Express.Multer.File
  ) {
    return await TrelloController.__createAttachment(cardId, file);
  }

  static async createNewBoard(name: string, color: string) {
    return await TrelloController.__createNewBoard(name, color);
  }

  static async updateBoard(
    id: string,
    values: { name: string; color: string }
  ) {
    return await TrelloController.__updateBoard(id, values);
  }

  static async removeWebhook(id: string) {
    return await TrelloController.__removeWebhook(id);
  }

  static async moveTaskToDiffList(
    cardId: string,
    listId: string,
    due?: string
  ) {
    return await TrelloController.__moveTaskToDiffList(
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
        .catch((err) => logger.warn("error in moving board", err));
      return result;
    } catch (error) {
      logger.error({ moveTaskToDiffListError: error });
    }
  }

  static async __deleteBoard(id: string) {
    try {
      let removeBoard = trelloApi(`boards/${id}?response_type=token&`);
      logger.warn({ removeBoard });
      return await fetch(removeBoard, {
        method: "DELETE",
      })
        .then((response) => {
          return response.text();
        })
        .catch((err) => logger.warn("error in delete board", err));
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
      let url = `cards/?idList=${data.teamListId ?? data.listId}&name=${
        data.name
      }&desc=${data.description}&`;
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
      let url = await trelloApi(`boards/${boardId}/lists?filter=all&`);
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
  static async _getCreationActionOfCard(cardId: string) {
    try {
      let url = await trelloApi(`cards/${cardId}/actions/?filter=createCard&`);
      let actions = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      return await actions.json();
    } catch (error) {
      logger.error({ _getCreationActionOfCardError: { cardId, error } });
    }
  }

  static async _getCardMovementsActions(cardId: string) {
    try {
      let url = await trelloApi(
        `cards/${cardId}/actions/?filter=updateCard:idList&`
      );
      let result = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      return await result.json();
    } catch (error) {
      logger.error({
        _getCardMovementsActionsError: { cardId: cardId, error },
      });
    }
  }

  static async _getCardDeadlineActions(cardId: string) {
    try {
      let url = await trelloApi(
        `cards/${cardId}/actions/?filter=updateCard:due&`
      );
      let actions = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/json" },
      });
      return await actions.json();
    } catch (error) {
      logger.error({ _getCardMovementsActionsError: error });
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
  static async __getCard(cardId: string) {
    try {
      let url = trelloApi(`cards/${cardId}?`);
      let card = await fetch(url, { method: "GET" });
      if (card.ok === true) return await card.json();
      else return null;
    } catch (error) {
      logger.error({ getCardError: error });
    }
  }
  static async __getTrelloBoards(filter: string) {
    try {
      let boardsApi = trelloApi(
        `organizations/${Config.get(
          "trelloOrgId"
        )}/boards/?filter=${filter}&fields=id,name,closed&`
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

  static async createComment(id: string, text: string) {
    let url = trelloApi(`cards/${id}/actions/comments?text=${text}&`);
    let result = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    if (result.ok) return await result.json();
    else return null;
  }

  static async getComments(cardId: string) {
    try {
      let url = trelloApi(`cards/${cardId}/actions?filter=commentCard&`);
      let comments = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      if (comments.ok) return await comments.json();
      else return null;
    } catch (error) {
      logger.error({ getCommentsError: error });
    }
  }

  static async createCheckList(cardId: string, checkListName: string) {
    try {
      let url = trelloApi(
        `/checklists?idCard=${cardId}&name=${checkListName}&`
      );
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      if (response.ok) return await response.json();
      else return null;
    } catch (error) {
      logger.error({ createCheckListError: error });
    }
  }
  static async createCheckListsItems(
    checkListId: string,
    name: string,
    checked: boolean,
    due: string,
    dueReminder: string,
    idMember: string
  ) {
    try {
      let url = trelloApi(
        `/checklists/${checkListId}/checkItems?name=${name}&checked=${checked}&due=${due}&dueRemember=${dueReminder}&idMember=${idMember}&`
      );
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      return await response.json();
    } catch (error) {
      logger.error({ createCheckListError: error });
    }
  }

  static async getChecklists(cardId: string) {
    try {
      let url = trelloApi(
        `cards/${cardId}/checklists?checkItems=all&checkItem_fields=true&`
      );
      let response = await fetch(url, {
        method: "GET",
      });
      if (response.ok) return await response.json();
      else {
        console.log({ response: await response.json() });
        return null;
      }
    } catch (error) {
      logger.error({ getChecklistsError: error });
    }
  }
  static async createLabel(cardId: string, labelId: string) {
    try {
      let url = trelloApi(
        `cards/${cardId}/idLabels?value=${encodeURIComponent(labelId)}&`
      );
      let response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
      });
      console.log({ response });
      if (response.ok) return await response.json();
      else {
        console.log({ response: await response.json() });
        return null;
      }
    } catch (error) {
      logger.error({ createLabelError: error });
    }
  }

  static async __updateCard({ cardId, data }: editCardParams) {
    try {
      let body = {
        name: data.name,
        desc: data.desc,
        due: data.due,
        start: data.start,
        idList: data.idList,
        idBoard: data.idBoard,
        closed: false,
      };
      if (data?.closed === true) body.closed = true;
      else body.closed = false;

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
          return err;
        });
      return response;
    } catch (error) {
      logger.error({ __updateCardError: error });
    }
  }

  static async _getActionsOfBoard(board: string) {
    try {
      let actions: any[] = await TrelloController._fetchActionsOfBoard(
        [],
        board
      );
      console.log({ actions });
      return actions;
    } catch (error) {
      logger.error({ _getActionsOfBoardError: error });
    }
  }
  static async _fetchActionsOfBoard(
    actions: TrelloAction[] = [],
    board: string
  ): Promise<any[]> {
    let url = await trelloApi(
      `boards/${board}/actions/?filter=createCard,updateCard:due,updateCard:idList&`
    );
    if (actions.length > 0)
      url += `${url}before=${actions[actions.length - 1].id}&`;
    let result = await fetch(url);
    let newActions: TrelloAction[] = await result.json();
    actions.push(...newActions);
    if (newActions.length === 50) {
      return await this._fetchActionsOfBoard(actions, board);
    } else return actions;
  }
  static async getActionsOfCard(
    cardId: string,
    departments: IDepartment[],
    due: Date | null
  ) {
    try {
      let currentTeam: ITeam;
      let createAction: TrelloAction[] =
        await TrelloController._getCreationActionOfCard(cardId);
      let actions: TrelloAction[] =
        await TrelloController._getCardMovementsActions(cardId);
      actions = _.sortBy(actions, "date");
      let dueChanges: TrelloAction[] =
        await TrelloController._getCardDeadlineActions(cardId);
      dueChanges =
        dueChanges.length > 0
          ? dueChanges.map((i) => {
              return { ...i, date: new Date(i.date).getTime() };
            })
          : [];
      dueChanges =
        dueChanges.length > 0 ? _.orderBy(dueChanges, "date", "desc") : [];
      let dueDates =
        dueChanges.length > 0
          ? dueChanges.map((i) => new Date(i.data.card.due).getTime())
          : [];
      dueDates = dueDates.sort((a, b) => b - a);
      let cardsActions: CardAction[] = [
        new CardAction(
          createAction[0],
          dueDates[0] ?? due ? new Date(due).toDateString() : null
        ),
        ...actions.map(
          (action, index) =>
            new CardAction(
              action,
              dueDates[index] ?? due ? new Date(due).toDateString() : null
            )
        ),
      ];
      /// First create status
      cardsActions = cardsActions.filter(
        (i) => i?.action?.deleteAction === false
      );
      let movements: Movement[] = cardsActions.map((cardAction) => {
        return {
          movedAt: new Date(cardAction.action.date).toString(),
          listId: cardAction.action.listId,
          status: cardAction.action.status,
          isTeam: cardAction.action.listType === "team",
          journeyDeadline: cardAction.action.dueChange,
        };
      });
      return { movements, currentTeam, createdAt: createAction[0].date };
    } catch (error) {
      logger.error({ getActionsOfCardError: error });
    }
  }
}

class CardAction {
  action: TrelloAction;
  dueDate: string | number | null;
  constructor(action: TrelloAction, dueDate: number | string) {
    action.deleteAction = false;
    this.action = action;
    this.dueDate = dueDate;
  }

  validate = (deps: IDepartment[]) => {
    let board = deps.find((i) => i.boardId === this.action.data.board.id);
    let date = this.action.date;
    let listId = this.action.data?.list?.id ?? this.action.data?.listAfter?.id;
    this.action.listId = listId;
    let listName =
      this.action.data?.list?.name ?? this.action.data?.listAfter?.name;
    if (!board || !date) {
      this.action.deleteAction = true;
      return this;
    }
    let list = board?.lists?.find((l) => l.listId === listId);
    if (list) {
      this.action.listType = "list";
      this.action.status = list.name;
    } else {
      list = board?.teams?.find((t) => t.listId === listId);
      if (list) {
        this.action.listType = "team";
        this.action.status = "In Progress";
      } else {
        list = board.sideLists.find((i) => i.listId === listId);
        if (list) {
          this.action.listType = "sidelist";
          this.action.status = "Tasks Board";
        } else {
          list = listName
            ? board.lists.find((l) => listName.includes(l.name))
            : null;
          if (list) {
            this.action.data.list.id = list.listId;
            this.action.status = list.name;
            this.action.listType = "list";
          } else {
            this.action.deleteAction = true;
          }
        }
      }
    }
    if (
      ["Shared", "Done", "Cancled"].includes(this.action.status) &&
      this.dueDate
    ) {
      this.action.dueChange = new Date(this.dueDate).toDateString();
    }
    return this;
  };
}
export default TrelloController;
