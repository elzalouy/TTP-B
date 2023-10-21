import { Movement, TaskData, TaskInfo } from "./../types/model/tasks";
import logger from "../../logger";
import TaskDB from "../dbCalls/tasks/tasks";
import {
  deleteTaskFromBoardJob,
  moveTaskJob,
  updateCardJob,
} from "../backgroundJobs/actions/task.actions.Queue";
import { provideCardIdError } from "../types/controller/Tasks";
import { taskRoutesQueue } from "../backgroundJobs/routes/tasks.Route.Queue";
import config from "config";
import {
  IDepartment,
  IDepartmentState,
  ITeam,
  ListTypes,
} from "../types/model/Department";
import TrelloController, { CardAction } from "./trello";
import {
  Board,
  Card,
  CheckList,
  CheckListItem,
  List,
  TrelloAction,
} from "../types/controller/trello";
import _, { uniqueId } from "lodash";
import Tasks from "../models/Task";
import { writeFile } from "fs";
import { randomUUID } from "crypto";
import Department from "../models/Department";
import Config from "config";
import { TaskPlugin } from "../types/model/TaskPlugins";
import TasksPlugins from "../models/TaskPlugins";
import { ObjectId } from "mongodb";
class TaskController extends TaskDB {
  static async getTasks(data: TaskData) {
    return await TaskController.__getTasks(data);
  }

  static async createTask(data: TaskData, files: any) {
    return await TaskController.__CreateNewTask(data, files);
  }

  static async updateTask(data: object, files: any, tokenUser: any) {
    return await TaskController.__updateTaskData(data, files, tokenUser);
  }

  static async filterTasks(data: any) {
    return await TaskController.__filterTasksDB(data);
  }

  static async deleteTask(id: string) {
    return await TaskController.__deleteTask(id);
  }

  static async deleteTasksByProjectId(id: string) {
    return await TaskController.__deleteTasksByProjectId(id);
  }

  static async deleteTasks(ids: string[]) {
    return await TaskController.__deleteTasks(ids);
  }

  static async deleteTasksWhere(data: TaskData) {
    return await TaskController.__deleteTasksWhere(data);
  }

  static async downloadAttachment(cardId: string, attachmentId: string) {
    return await TaskController.__downloadAttachment(cardId, attachmentId);
  }

  static async createTaskByTrello(data: TaskData) {
    return await TaskController.__createTaskByTrello(data);
  }

  static async moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    department: IDepartment,
    user: any,
    deadline?: string
  ) {
    return await TaskController.__moveTaskOnTrello(
      cardId,
      listId,
      status,
      department,
      user,
      deadline
    );
  }

  static async __moveTaskOnTrello(
    cardId: string,
    listId: string,
    status: string,
    department: IDepartmentState,
    user: any,
    deadline?: string
  ) {
    try {
      moveTaskJob(listId, cardId, status, department, user, deadline);
      return {
        data: `Task with cardId ${cardId} has moved to list ${
          department.lists.find((list) => list.listId === listId).name
        }`,
      };
    } catch (error) {
      logger.error({ moveTaskOnTrelloError: error });
    }
  }

  static async __updateTaskData(
    data: TaskData,
    files: Express.Multer.File[],
    tokenUser: any
  ) {
    try {
      if (!data.cardId) return provideCardIdError;
      updateCardJob(data, files, tokenUser);
    } catch (error) {
      logger.error({ updateTaskError: error });
    }
  }

  /**
   * createTaskAttachment
   * it should be fired inside of a async background job with the webhook
   * @param files to be uploaded
   * @param data to be changes
   * @returns update task
   */
  static async __createTaskAttachment(
    files: Express.Multer.File[],
    data: TaskData
  ) {
    try {
      if (files && files.length > 0) {
        let newAttachments = await files.map(async (file) => {
          return await TrelloController.createAttachmentOnCard(
            data.cardId,
            file
          );
        });
        let attachedFiles = await Promise.all(newAttachments);
        data.attachedFiles = [];
        attachedFiles.forEach((item) => {
          data.attachedFiles.push({
            trelloId: item.id,
            name: item.fileName,
            mimeType: item.mimeType,
            url: item.url,
          });
        });
      } else delete data.attachedFiles;
      return data;
    } catch (error) {
      logger.error({ createTaskAttachmentError: error });
    }
  }

  /**
   * Create New Task
   * Create task with the initial data needed, it takes the initial data (taskData, and files)
   * * name (required)
   * * projectId (required)
   * * categoryId (optional)
   * * subCategoryId (optional)
   * * boardId (required)
   * * cardId (required)
   * * listId (required)
   * * status (required)
   * * start (required)
   * * description (optional)
   * * AttachedFiles [Array]
   *   * mimeType
   *   * id
   *   * name
   *   * url
   *   * fileName
   * * movements (at least 1)
   *   * index
   *   * status
   *   * movedAt
   * @param data TaskData
   * @param files TaskFiles
   * @returns Task
   */
  static async __CreateNewTask(data: TaskData, files: Express.Multer.File[]) {
    try {
      let task: TaskInfo;
      data.attachedFiles = [];
      let createdCard: { id: string } | any =
        await TrelloController.createCardInList(data);
      if (createdCard) {
        data.cardId = createdCard.id;
        data.trelloShortUrl = createdCard.shortUrl;
        data.cardCreatedAt = new Date(Date.now());
        data.movements = [
          {
            listId: data.listId,
            movedAt: new Date(Date.now()).toString(),
            listType: "list",
            status: data.status,
          },
        ];
        if (data.teamId) data.assignedAt = new Date(Date.now());
        task = await super.createTaskDB(data);
        if (task) {
          taskRoutesQueue.push(async () => {
            data.cardId = createdCard.id;
            data.trelloShortUrl = createdCard.shortUrl;
            if (files.length > 0)
              data = await TaskController.__createTaskAttachment(files, data);
            TrelloController.createWebHook(data.cardId, "trelloWebhookUrlTask");
          });
        }
      }
      return task;
    } catch (error) {
      logger.error({ createTaskError: error });
    }
  }

  static async __getTasks(data: TaskData) {
    try {
      let tasks = await super.getTasksDB(data);
      let csvData = await Tasks.getTasksAsCSV(
        tasks
          .filter((item) => item.status === "Not Clear")
          .map((item) => item._id)
      );
      return tasks;
    } catch (error) {
      logger.error({ getTasksError: error });
    }
  }

  static async __downloadAttachment(cardId: string, attachmentId: string) {
    try {
      let response = await TrelloController.downloadAttachment(
        cardId,
        attachmentId
      );
      return response;
    } catch (error) {
      logger.error({ downloadAttachmentError: error });
      return { error: "FileError", status: 400 };
    }
  }

  static async __createTaskByTrello(data: TaskData) {
    try {
      let response = await super.__createTaskByTrelloDB(data);
      if (response?.cardId)
        await TrelloController.createWebHook(
          response.cardId,
          "trelloWebhookUrlTask"
        );
      return response;
    } catch (error) {
      logger.error({ createTaskByTrelloError: error });
    }
  }

  static async __editTasksProjectId(ids: string[], projectId: string) {
    try {
      let result = await super.__updateTasksProjectId(projectId, ids);
      return result;
    } catch (error) {
      logger.error({ __updateTasksProjectId: error });
    }
  }

  static async getTasksCSV(data: string[]) {
    try {
      let csvData = await Tasks.getTasksAsCSV(data);
      if (csvData) {
        let root = __dirname.split("/controllers")[0].concat("/uploads/");
        let fileName = `tasksSatatistics-${randomUUID()}.csv`;
        writeFile(
          root + fileName,
          csvData.toString(),
          { encoding: "utf8" },
          () => {}
        );
        return { fileName, root, csvData };
      }
    } catch (error) {
      logger.error({ _getTasksCsv: error });
    }
  }

  // Delete Handlers
  static async __deleteTasksByProjectId(id: string) {
    try {
      let tasks = await super.getTasksDB({
        projectId: id,
      });
      tasks.forEach(async (item) => {
        if (item.cardId) {
          await TrelloController.deleteCard(item.cardId);
          await TrelloController.removeWebhook(item.cardId);
        }
      });
      return await super.deleteTasksByProjectIdDB(id);
    } catch (error) {
      logger.error({ DeleteTasksByProjectId: error });
    }
  }

  static async __deleteTasksWhere(data: TaskData) {
    try {
      let deleteResult = await super.deleteTasksWhereDB(data);
      deleteResult.forEach((item) =>
        TrelloController.removeWebhook(item.cardId)
      );
      if (deleteResult) return deleteResult;
      else throw "Error hapenned while deleting tasks";
    } catch (error) {
      logger.error({ DeleteTasksWhereError: error });
    }
  }

  static async __deleteTasks(ids: string[]) {
    try {
      let tasks = await super.getTasksByIdsDB(ids);
      tasks.forEach(async (item) => {
        TrelloController.deleteCard(item.cardId);
        TrelloController.removeWebhook(item.cardId);
      });
      let result = await super.deleteTasksDB(ids);
      return result;
    } catch (error) {
      logger.error({ DeleteTasksByProjectId: error });
    }
  }

  static async __deleteTask(id: string) {
    try {
      let task = await super.getTaskDB(id);
      if (task) {
        deleteTaskFromBoardJob(task);
        await TrelloController.deleteCard(task?.cardId);
        let result = await super.deleteTaskDB(id);
        if (result.isOk) return { isOk: true, message: "" };
        else return { isOk: false, message: "Task not Existed" };
      } else return { message: "Task not Existed", isOk: false };
    } catch (error) {
      logger.error({ deleteTaskError: error });
    }
  }

  static async getDeletedBack(count: number) {
    try {
      let board = await Department.findOne({
        name: Config.get("CreativeBoard"),
      });
      let tasks = await Tasks.find({
        archivedCard: true,
      })
        .sort({ archivedAt: "desc" })
        .limit(count);

      let newTasksUpdates = await Promise.all(
        tasks.map(async (task) => {
          let card: Card = await TrelloController.__createCard({
            name: task.name,
            listId: board.lists.find((i) => i.name === task.status).listId,
            boardId: board.boardId,
            description: task.description,
            deadline: task.deadline,
            start: task.start,
          });
          return {
            _id: task._id,
            cardId: card.id,
            listId: board.lists.find((i) => i.name === task.status).listId,
            boardId: board.boardId,
            description: task.description,
            deadline: task.deadline,
            start: task.start,
            trelloShortUrl: card.shortUrl,
            archivedCard: false,
          };
        })
      );

      let plugins = await TasksPlugins.find({});

      let updatePlugins = await Promise.all(
        newTasksUpdates.map(async (taskUpdate) => {
          let plugin = plugins.find(
            (i) => i.taskId === taskUpdate._id.toString()
          );
          if (plugin) {
            plugin.cardId = taskUpdate.cardId;
            plugin.comments.forEach((comment) =>
              TrelloController.createComment(taskUpdate.cardId, comment.comment)
            );
            await Promise.all(
              plugin.labels.map(async (label) => {
                await TrelloController.createLabel(taskUpdate.cardId, label.id);
                return label;
              })
            );
            plugin.checkLists = await Promise.all(
              plugin.checkLists.map(async (i) => {
                let checkListResponse: CheckList =
                  await TrelloController.createCheckList(
                    taskUpdate.cardId,
                    i.name
                  );
                checkListResponse.checkItems = await Promise.all(
                  i.checkItems.map(
                    async (item) =>
                      await TrelloController.createCheckListsItems(
                        checkListResponse.id,
                        item.name,
                        item.state === "incomplete" ? false : true,
                        item.due,
                        item.dueReminder,
                        item.idMember
                      )
                  )
                );

                return checkListResponse;
              })
            );
            return {
              updateOne: {
                filter: { _id: plugin._id },
                update: {
                  cardId: taskUpdate.cardId,
                  checkLists: plugin.checkLists,
                },
              },
            };
          } else return null;
        })
      );
      updatePlugins = updatePlugins.filter((i) => i !== null);
      let update = [
        ...newTasksUpdates.map((i) => {
          return {
            updateOne: {
              filter: { _id: i._id },
              update: {
                cardId: i.cardId,
                listId: i.listId,
                boardId: i.boardId,
                trelloShortUrl: i.trelloShortUrl,
                archivedCard: i.archivedCard,
              },
              upsert: false,
            },
          };
        }),
      ];
      await TasksPlugins.bulkWrite(updatePlugins);
      await Tasks.bulkWrite(update);
    } catch (error) {
      logger.error({ getDeletedBackError: error });
    }
  }
  static async matchTasksWithTrello() {
    try {
      console.log("matching tasks");
      let departments: IDepartment[],
        newTasks: TaskInfo[] = [],
        tasks: TaskInfo[],
        cards: Card[],
        cardsActions: { cardId: string; actions: TrelloAction[] }[] = [],
        cardsIds: string[],
        actions: TrelloAction[];

      // (1) get departments
      // (2) get tasks and actions
      // loop over cards :
      // save same data on DB
      // save actions of this year cards
      // archive all not existed tasks as cards.

      departments = await Department.find({});
      tasks = await Tasks.find({});
      cards = _.flattenDeep(
        await Promise.all(
          departments?.map(async (item) => {
            let boardCards: Card[] = await TrelloController.__getCardsInBoard(
              item.boardId
            );
            return boardCards;
          })
        )
      );

      actions = _.flattenDeep(
        await Promise.all(
          departments.map(async (item) => {
            return await TrelloController._getActionsOfBoard(item.boardId);
          })
        )
      );

      actions = actions.filter(
        (action) => action !== undefined && action !== null
      );

      let createActions = actions
        .filter((i) => i.type === "createCard")
        .map((i) => i.data.card.id);

      actions = actions.filter((a) => createActions.includes(a.data.card.id));
      cards = cards.filter((c) => createActions.includes(c.id));
      cardsActions = cards.map((card) => {
        let cardActions = actions.filter(
          (action) => action.data.card.id === card.id
        );
        if (cardActions) return { cardId: card.id, actions: cardActions };
        else return { cardId: card.id, actions: [] };
      });
      cardsActions = cardsActions.filter((item) => item.actions.length > 0);
      cards = cards.filter((card) => {
        let actions = cardsActions.filter(
          (action) => action.cardId === card.id
        );
        if (actions) return card;
      });
      cards = await Promise.all(
        cards?.map(async (item) => {
          let attachments = await TrelloController.__getCardAttachments(
            item.id
          );
          item.attachments = attachments ?? [];
          return item;
        })
      );
      tasks = cards.map((card, index) => {
        let fetch = tasks.find((t) => t.cardId === card.id);
        let task = fetch ?? new Tasks({});
        let actions = cardsActions.find(
          (cardAction) => cardAction.cardId === card.id
        );
        let department = departments.find(
          (dep) => dep.boardId === card.idBoard
        );
        let { movements, createAction, deadlineChanges } =
          TaskController.validateCardActions(
            actions.actions,
            department,
            task.deadline ? new Date(task.deadline).toString() : null
          );
        let teamMovements = movements.filter(
          (move) => move.listType === "team"
        );
        let teamId =
          teamMovements && teamMovements.length > 0
            ? department.teams.find(
                (team) =>
                  team.listId === teamMovements[teamMovements.length - 1].listId
              )._id
            : null;
        console.log({ taskBeforeUpdate: task });
        task.boardId = card.idBoard;
        task.listId = card.idList;
        task.cardId = card.id;
        task.name = card.name;
        task.teamId = teamId ?? task.teamId ?? null;
        task.status = movements[movements.length - 1].status;
        task.movements = movements;
        task.archivedCard = card.closed ?? task.archivedCard;
        task.trelloShortUrl = card.shortUrl;
        task.description = card.desc;
        task.deadline = card.due ?? task.deadline;
        task.start = card.start ?? task.start;
        task.attachedFiles =
          card?.attachments?.length > 0
            ? card?.attachments?.map((item) => {
                return {
                  name: item.fileName,
                  trelloId: item.id,
                  mimeType: item.mimeType,
                  url: item.url,
                };
              })
            : [];
        task.cardCreatedAt = new Date(createAction.date);
        if (!fetch) newTasks.push(task);
        else return task;
      });
      let update = [
        ...newTasks.map((item) => {
          return {
            insertOne: {
              document: item,
            },
          };
        }),
        ...tasks?.map((item) => {
          return {
            updateOne: {
              filter: { _id: item._id },
              update: {
                name: item.name,
                projectId: item.projectId,
                categoryId: item.categoryId,
                subCategoryId: item.subCategoryId,
                teamId: item.teamId,
                listId: item.listId,
                status: item.status,
                cardId: item.cardId,
                start: item.start ? item.start : null,
                deadline: item.deadline,
                boardId: item.boardId,
                description: item?.description ? item.description : "",
                trelloShortUrl: item.trelloShortUrl,
                attachedFiles: item.attachedFiles,
                movements: item.movements,
                archivedCard: item.archivedCard,
                archivedAt: item.archivedAt,
                cardCreatedAt: item.cardCreatedAt,
              },
            },
          };
        }),
      ];
      // Tasks.bulkWrite(update, {});
      // newTasks.forEach(async (item) => {
      //   TrelloController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
      // });
    } catch (error) {
      logger.error({ matchTasksWithTrelloError: error });
    }
  }
  static validateCardActions(
    cardActions: TrelloAction[],
    department: IDepartment,
    dueDate?: string | number | null
  ) {
    try {
      console.log({ cardActions, department, dueDate });
      let createAction = cardActions.find(
        (item) => !item.data.old && !item.data.listBefore && !item.data.card.due
      );
      let createActionMovement = new CardAction(createAction);
      createActionMovement = createActionMovement.validate(department);
      let deadlineChanges = cardActions.filter((item) => item.data.card.due);
      console.log({ createActionMovement });
      deadlineChanges = deadlineChanges.map((item) => {
        return { ...item, due: new Date(item.date).getTime() };
      });
      _.orderBy(deadlineChanges, "due", "asc");
      console.log({ deadlineChanges });
      let createActionItem: Movement = {
        status: createActionMovement.action.status,
        listId: createActionMovement.action.listId,
        movedAt: new Date(createActionMovement.action.date).toString(),
        listType: createActionMovement.action.listType,
      };
      console.log({ createActionItem });
      let movementsChanges = cardActions.filter(
        (item) => item.data.listAfter && item.data.old.idList
      );
      console.log({ movementsChanges });
      movementsChanges = movementsChanges.map((item) => {
        return { ...item, dateNumber: new Date(item.date).getTime() };
      });

      movementsChanges = movementsChanges.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      console.log({ sortedMovementsChanges: movementsChanges });
      let movements: Movement[] = movementsChanges.map((move, index) => {
        let movementAction = new CardAction(move);
        movementAction = movementAction.validate(department);
        let moveItem: Movement = {
          status: movementAction.action.status,
          listId: movementAction.action.listId,
          movedAt: new Date(movementAction.action.date).toString(),
          listType: movementAction.action.listType,
        };

        if (
          ["Done", "Shared", "Not Clear"].includes(movementAction.action.status)
        ) {
          moveItem.journeyDeadline =
            deadlineChanges.length > 0
              ? deadlineChanges[0].data.card.due
              : dueDate
              ? new Date(dueDate).toString()
              : null;
          deadlineChanges = deadlineChanges.filter((i, index) => index > 0);
        }
        console.log({ moveItem });
        return moveItem;
      });
      console.log({ createActionItem, movements });
      movements = [createActionItem, ...movements];
      return { movements, deadlineChanges, createAction };
    } catch (error) {
      logger.error({ validateCardActionsError: error });
    }
  }
}

export default TaskController;
