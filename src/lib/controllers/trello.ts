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
  List,
  TrelloAction,
  editCardParams,
  updateCardResponse,
} from "../types/controller/trello";
import { ProjectData, ProjectInfo } from "../types/model/Project";
import { IDepartment, ITeam, ListTypes } from "../types/model/Department";
import _ from "lodash";
import { ITrelloActionsOfSnapshot } from "../types/model/TrelloActionsSnapshots";
import TrelloSnapshot from "../models/TrelloSnapshots";
import Tasks from "../models/Task";
import { ObjectId } from "mongodb";
import { postAsnaphotOfTrelloActions } from "../backgroundJobs/actions/trello.actions.cron";

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
  static async getBoardsActions(
    boardId: string,
    format: "list" | "count",
    limit?: number,
    page?: number
  ) {
    try {
      let url = `boards/${boardId}/actions/?format=${format}&`;
      let apiUrl = trelloApi(url);
      let result;
      await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }).then(async (res) => {
        result = await res.json();
      });
      return result;
    } catch (error) {
      logger.error({ getBoardsActionsError: error });
    }
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
      let url = `cards/?idList=${
        data.teamListId ?? data.listId
      }&name=${decodeURIComponent(data.name)}&desc=${decodeURIComponent(
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
      logger.error({ error });
    }
  }

  static async _getCardMovementsActions(cardId: string) {
    try {
      let page = 0;
      let actions: TrelloAction[] = [];
      for (page; page <= 19; page++) {
        let url = await trelloApi(
          `cards/${cardId}/actions/?filter=updateCard:idList&page=${page}&`
        );
        let newActions: TrelloAction[] = await fetch(url, {
          method: "GET",
          headers: { Accept: "application/json" },
        }).then(async (res) => {
          return await res.json();
        });
        if (newActions) actions = [...actions, ...newActions];
        if (newActions.length < 50) break;
      }
      return actions;
    } catch (error) {
      logger.error({ _getCardMovementsActionsError: error });
    }
  }

  static async _getCardDeadlineActions(cardId: string) {
    try {
      let url = await trelloApi(
        `cards/${cardId}/actions/?filter=updateCard:idList&`
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
  static async addCommentToCard(id: string, text: string) {
    let trelloApi = `cards/${id}/actions/comments?text=${text}&`;
    let result = await fetch(trelloApi, {
      method: "POST",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    if (result.ok) return await result.json();
    else return null;
  }
  static async uodateCommentToCard(id: string, text: string, idAction: string) {
    let trelloApi = `cards/${id}/actions/${idAction}/comments?text=${text}&`;
    let result = await fetch(trelloApi, {
      method: "PUT",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    if (result.ok) return await result.json();
    else return null;
  }
  static async deleteCommentToCard(id: string, text: string, idAction: string) {
    let trelloApi = `cards/${id}/actions/${idAction}/comments?`;
    let result = await fetch(trelloApi, {
      method: "DELETE",
      headers: {
        Accept: "*/*",
        "Content-Type": "application/json",
      },
    });
    if (result.ok) return await result.json();
    else return null;
  }

  static async __updateCard({ cardId, data }: editCardParams) {
    try {
      let body = {
        name: decodeURIComponent(data.name),
        desc: decodeURIComponent(data.desc),
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

  static async __postSnapshotOfActions() {
    try {
      let boards: Board[] = await TrelloController.getBoardsInTrello("open");
      let pages = [];
      let actionsByBoards = await Promise.all(
        boards.map(async (i) => {
          let count: number = await TrelloController.getBoardsActions(
            i.id,
            "count"
          ).then((res: any) => res._value);
          pages = new Array(Math.ceil(count / 1000)).fill(0);
          let actions: ITrelloActionsOfSnapshot[] = _.flattenDeep(
            await Promise.all(
              pages.map(async (page, index) => {
                return await TrelloController.getBoardsActions(
                  i.id,
                  "list",
                  1000,
                  index + 1
                );
              })
            )
          );
          return { total: count, actions };
        })
      );
      let snapShot = new TrelloSnapshot({
        actions: _.flattenDeep(
          actionsByBoards.map((actions) => actions.actions)
        ),
        createdAt: new Date(Date.now()),
      });
      await snapShot.save();
      return actionsByBoards;
    } catch (error: any) {
      logger.error({ __postSnapshotOfActionsError: error });
    }
  }

  static async restoreTrelloCards(id: string) {
    try {
      let boards: Board[] = await TrelloController.getBoardsInTrello("open");
      boards = await Promise.all(
        boards?.map(async (item: Board) => {
          let lists: List[] = await TrelloController.__getBoardLists(item.id);
          item.lists = lists;
          return item;
        })
      );
      let activities = await TrelloSnapshot.findOne({
        _id: new ObjectId(id),
      });
      let actions = activities?.actions?.filter((i) =>
        ["createCard", "updateCard", "deleteCard"].includes(i.type)
      );

      TrelloController.__restoreTaskActions(actions, boards);
      return { activities };
    } catch (error) {
      logger.error({ error });
    }
  }

  static async __restoreTaskActions(
    actions: ITrelloActionsOfSnapshot[],
    boards: Board[]
  ) {
    try {
      let creativeBoard = boards.find(
        (board) => board.name === Config.get("CreativeBoard")
      );
      let deletedCards = actions?.filter((i) => i.type === "deleteCard");
      let newCards: Card[] = await Promise.all(
        deletedCards.map(async (cardAction) => {
          let cardActions = actions.filter(
            (action) => action.data.card.id === cardAction.data.card.id
          );
          let board =
            boards.find((board) => board.id === cardAction.data.board.id) ??
            creativeBoard;
          let list =
            board.lists.find((i) => i.name === cardAction.data.list.name) ??
            creativeBoard.lists.find((list) => list.name === "Tasks Board");
          let card: Card = await TrelloController.__createCard({
            name: cardAction.data?.card?.name ?? "",
            listId: list?.id,
            boardId: board?.id,
          });
          await TrelloController.__addWebHook(card.id, "trelloWebhookUrlTask");
          await cardActions.map(async (action) => {
            if (action.type === "updateCard")
              await TrelloController.__updateCard({
                cardId: card.id,
                data: {
                  name: action.data.card.name,
                  idList: ListTypes.includes(action.data.list.name)
                    ? board.lists.find(
                        (list) => list.name === action.data.list.name
                      ).id
                    : list.id,
                  idBoard: board.id,
                  desc: action.data?.card?.desc ?? card?.desc ?? undefined,
                  due: action.data?.card?.due ?? card?.due ?? undefined,
                  start: action.data?.card?.start ?? card?.start ?? undefined,
                },
              });
            else if (action.type === "commentCard")
              await TrelloController.addCommentToCard(
                card.id,
                action.data.text
              );
          });
          return card;
        })
      );
    } catch (error) {
      logger.error({ restoreTaskActionsError: error });
    }
  }

  static async deleteOldSnapshots() {
    try {
      let snapshots = await TrelloSnapshot.find({}).sort({ createdAt: 1 });
      // if(snapshots.length>15)
    } catch (error) {
      logger.error({ error });
    }
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

      cardsActions = cardsActions.map((cardAction) =>
        cardAction.validate(departments)
      );
      /// First create status
      cardsActions = cardsActions.filter(
        (i) => i?.action?.deleteAction === false
      );
      let movements: Movement[] = cardsActions.map((cardAction) => {
        return {
          movedAt: new Date(cardAction.action.date).toDateString(),
          listId: cardAction.action.listId,
          status: cardAction.action.status,
          isTeam: cardAction.action.listType === "team",
          journeyDeadline: cardAction.action.dueChange,
        };
      });
      return { movements, currentTeam, createdAt: createAction[0].date };
    } catch (error) {
      logger.error({ error });
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
      logger.info({
        type: "existed_in_current_list_status",
        name: this.action.data.card.name,
        list: listName,
        listId,
        cardId: this.action.data.card.id,
      });
    } else {
      list = board?.teams?.find((t) => t.listId === listId);
      if (list) {
        logger.info({
          type: "existed_in_current_list_team",
          name: this.action.data.card.name,
          list: listName,
          listId,
          cardId: this.action.data.card.id,
        });

        this.action.listType = "team";
        this.action.status = "In Progress";
      } else {
        list = board.sideLists.find((i) => i.listId === listId);
        if (list) {
          logger.info({
            type: "existed_in_current_list_sideList",
            name: this.action.data.card.name,
            list: listName,
            listId,
            cardId: this.action.data.card.id,
          });
          this.action.listType = "sidelist";
          this.action.status = "Tasks Board";
        } else {
          list = listName
            ? board.lists.find((l) => listName.includes(l.name))
            : null;
          if (list) {
            logger.info({
              type: "existed_in_archived_list_status",
              name: this.action.data.card.name,
              list: listName,
              listId,
              cardId: this.action.data.card.id,
            });
            this.action.data.list.id = list.listId;
            this.action.status = list.name;
            this.action.listType = "list";
          } else {
            logger.info({
              type: "not_existed_in_any_list_and_will_be_delete_this_action",
              name: this.action.data.card.name,
              listName: listName,
              listId,
              cardId: this.action.data.card.id,
            });
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
