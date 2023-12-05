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
      let actions: TrelloAction[] =
        await TrelloController._getCreationActionOfCard(createdCard.id);
      if (createdCard) {
        data.cardId = createdCard.id;
        data.trelloShortUrl = createdCard.shortUrl;
        data.cardCreatedAt = new Date(Date.now());
        data.movements = [
          {
            actionId: actions[0].id,
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
      let board: IDepartment, tasks: TaskInfo[], plugins: TaskPlugin[], update;
      board = await Department.findOne({
        name: Config.get("CreativeBoard"),
      });
      tasks = await Tasks.find({
        archivedCard: true,
      })
        .sort({ archivedAt: "desc" })
        .limit(count);
      if (tasks.length === 0) return { nResult: 0 };

      tasks = await Promise.all(
        tasks.map(async (task) => {
          let listId = board.lists.find((i) => i.name === task.status).listId;
          let card: Card = await TrelloController.__createCard({
            name: `${task.name} ID-${task._id.toString()}`,
            listId: listId,
            boardId: board.boardId,
            description: task.description,
            deadline: task.deadline,
            start: task.start,
          });
          task.name = `${task.name} ID-${task._id.toString()}`;
          task.archivedCard = false;
          task.cardId = card.id;
          task.listId = card.idList;
          task.boardId = card.idBoard;
          task.trelloShortUrl = card.shortUrl;
          return task;
        })
      );

      plugins = await TasksPlugins.find({});
      if (plugins && plugins.length > 0) {
        let updatePlugins = await Promise.all(
          tasks.map(async (taskUpdate) => {
            let plugin = plugins.find(
              (i) => i.taskId === taskUpdate._id.toString()
            );
            if (plugin) {
              plugin.cardId = taskUpdate.cardId;
              plugin.comments.forEach((comment) =>
                TrelloController.createComment(
                  taskUpdate.cardId,
                  comment.comment
                )
              );

              await Promise.all(
                plugin.labels.map(async (label) => {
                  await TrelloController.createLabel(
                    taskUpdate.cardId,
                    label.id
                  );
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
        updatePlugins = updatePlugins.filter((i: any) => i !== null);
        await TasksPlugins.bulkWrite(updatePlugins);
      }

      update = [
        ...tasks.map((item) => {
          console.log({ _id: item._id.toString(), id: item._id });
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

      tasks.forEach((item) => {
        TrelloController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
      });

      return await Tasks.bulkWrite(update);
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
        cardsIds: string[],
        cardsActions: { cardId: string; actions: TrelloAction[] }[] = [],
        archivedCards: string[],
        archivedTasks: TaskInfo[],
        actions: TrelloAction[];

      // (1) get departments
      // (2) get tasks and actions
      // loop over cards :
      // save same data on DB
      // save actions of this year for the cards
      // archive all not existed tasks as cards.

      // getting data
      departments = await Department.find({});
      tasks = await Tasks.find({});

      // getting cards
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

      // cards ids
      cardsIds = cards.map((i) => i.id);

      // archived cards are the cards with and attribute 'closed' and equals true.
      archivedCards = cards.filter((i) => i.closed === true).map((i) => i.id);

      // archived tasks are all the previous archived cards or even not existed in the cards.
      archivedTasks = tasks.filter(
        (task) =>
          archivedCards.includes(task.cardId) || !cardsIds.includes(task.cardId)
      );

      // All actions of the boards.
      actions = _.flattenDeep(
        await Promise.all(
          departments.map(async (item) => {
            return await TrelloController._getActionsOfBoard(item.boardId);
          })
        )
      );

      // all actions filtered from nullable values
      actions = actions.filter(
        (action) => action !== undefined && action !== null
      );

      // extract the create actions, specifically the card id.
      let createActions = actions
        .filter((i) => i.type === "createCard")
        .map((i) => i.data.card.id);

      // let only the actions for the selected cards ids which have a create action.
      actions = actions.filter((a) => createActions.includes(a.data.card.id));

      // Also filter the cards by the create actions. so we will have only the cards which have a create action.
      cards = cards.filter((c) => createActions.includes(c.id));

      // Build the new Array of card id, and its actions.
      cardsActions = cards.map((card) => {
        let cardActions = actions.filter(
          (action) => action.data.card.id === card.id
        );
        if (cardActions) return { cardId: card.id, actions: cardActions };
        else return { cardId: card.id, actions: [] };
      });

      // remove all object with an empty array of actions.
      cardsActions = cardsActions.filter((item) => item.actions.length > 0);

      // insert the attachments of each card.
      cards = await Promise.all(
        cards?.map(async (item) => {
          let attachments = await TrelloController.__getCardAttachments(
            item.id
          );
          item.attachments = attachments ?? [];
          return item;
        })
      );

      // update the tasks based on its cards
      // 1. fetch the task if existed, and if not create a new one
      // 2. get the task actions, the department, and the archive value if true or false
      // 3. validate the actions, and extract the movements.
      // 4. get the teams movements, based on the movements array.
      // 5. update the card data
      tasks = cards.map((card, index) => {
        let fetch = tasks.find((t) => t.cardId === card.id);
        let task = fetch ?? new Tasks({});

        let actions = cardsActions.find(
          (cardAction) => cardAction.cardId === card.id
        );
        let department = departments.find(
          (dep) => dep.boardId === card.idBoard
        );
        let cardList =
          department.lists.find((i) => i.listId === card.idList) ??
          department.teams.find(
            (i) => i.listId === card.idList && i.isDeleted === false
          ) ??
          department.sideLists.find((i) => i.listId === card.idList) ??
          null;

        let { movements, createAction } = TaskController.validateCardActions(
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
        task.boardId = card.idBoard;
        task.listId = card.idList;
        task.cardId = card.id;
        task.name = card.name;
        task.teamId = teamId ?? task.teamId ?? null;
        task.status = movements[movements.length - 1].status;
        task.movements = movements;
        task.archivedCard =
          card.closed || task.archivedCard || cardList === null ? true : false;
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
        if (!fetch) {
          newTasks.push(task);
          return null;
        } else return task;
      });
      tasks = tasks.filter((i) => i !== null);
      newTasks = newTasks.filter((i) => i != null);
      console.log({ tasks: tasks.length, newTasks: newTasks });
      let insert = [
        ...newTasks.map((item) => {
          return {
            insertOne: {
              document: item,
            },
          };
        }),
      ];
      let archive = archivedTasks.map((task) => {
        return {
          updateOne: {
            filter: { _id: task._id.toString() },
            update: {
              archivedCard: true,
            },
          },
        };
      });
      let update = [
        ...insert,
        ...archive,
        ...tasks?.map((item) => {
          return {
            updateOne: {
              filter: { _id: item._id.toString() },
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

      let result = await Tasks.bulkWrite(update);
      console.log({ result });
      newTasks.forEach(async (item) => {
        TrelloController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
      });
      tasks.forEach(async (item) => {
        TrelloController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
      });
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
      let movements: Movement[] = [];
      // get the create action
      let createAction = cardActions.find((item) => item.type === "createCard");

      // build a new CardAction for the create action
      let createActionMovement = new CardAction(createAction);

      // validate the create action movement
      createActionMovement = createActionMovement.validate(department);
      let createActionItem: Movement = {
        actionId: createActionMovement.action.id,
        status: createActionMovement.action.status,
        listId: createActionMovement.action.listId,
        movedAt: new Date(createActionMovement.action.date).toString(),
        listType: createActionMovement.action.listType,
        listName: createActionMovement.action.listName,
      };

      // extract all 'updateCard' actions
      let sortedMoveOrDueChanges = cardActions.filter(
        (i) => i.type === "updateCard"
      );
      let due: { index: number; dueDate: string }[] = [];

      sortedMoveOrDueChanges.forEach((move, index) => {
        if (
          move.data.card.due &&
          movements.length > 0 &&
          movements[movements.length - 1]
        ) {
          movements[movements.length - 1].journeyDeadline = move.data.card.due;
        } else {
          let movementAction = new CardAction(move);
          movementAction = movementAction.validate(department);
          if (movementAction.action.deleteAction === true) return null;
          let moveItem: Movement = {
            actionId: movementAction.action.id,
            status: movementAction.action.status,
            listId: movementAction.action.listId,
            movedAt: new Date(movementAction.action.date).toString(),
            listType: movementAction.action.listType,
            listName: movementAction.action.listName,
          };
          movements.push(moveItem);
        }
      });
      movements = movements.filter((i) => i !== null);
      movements = [createActionItem, ...movements];
      movements = _.uniqBy(movements, "actionId");
      movements = movements.sort(
        (a, b) => new Date(a.movedAt).getTime() - new Date(b.movedAt).getTime()
      );
      return { movements, createAction };
    } catch (error) {
      logger.error({ validateCardActionsError: error, cardActions });
    }
  }
}

export default TaskController;
