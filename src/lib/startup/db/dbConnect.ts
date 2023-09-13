import { hashBassword } from "../../services/auth";
import { connect, ConnectOptions } from "mongoose";
import { config } from "dotenv";
import logger from "../../../logger";
import { UserData } from "../../types/model/User";
import UserDB from "../../dbCalls/user/user";
import Config from "config";
import Department from "../../models/Department";
import DepartmentController from "../../controllers/department";
import TrelloController from "../../controllers/trello";
import { IDepartment, IDepartmentState } from "../../types/model/Department";
import {
  Board,
  Card,
  TrelloAction,
  List,
  CheckList,
} from "../../types/controller/trello";
import { ListTypes } from "../../types/model/Department";
import _, { create } from "lodash";
import { TaskInfo } from "../../types/model/tasks";
import Tasks from "../../models/Task";
import TaskController from "../../controllers/task";
import { AnyBulkWriteOperation } from "mongodb";
import TasksPlugins from "../../models/TaskPlugins";
config();

const db: string = Config.get("mongoDbConnectionString");
logger.warn({ db: db });
interface DBOptions {
  useNewUrlParser: Boolean;
  useUnifiedTopology: Boolean;
}

const mongoDB: () => Promise<void> = async () => {
  try {
    const options: DBOptions & ConnectOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: process.env.NODE_ENV === "production" ? false : true,
      autoCreate: process.env.NODE_ENV === "production" ? false : true,
      //By default, mongoose buffers commands when the connection goes down until the driver manages to reconnect. To disable buffering, set bufferCommands to false.
      bufferCommands: true,
      // how much time mongo can wait until berfore throwing an error
      connectTimeoutMS: 5000,
    };

    await connect(db, options);
    console.log("Mongo DB connected,", Config.get("mongoDbConnectionString"));
    initializeAdminUser();
  } catch (error) {
    console.error({ mongoDBError: error });
    process.exit(1);
  }
};

const initializeAdminUser = async () => {
  // adding superAdmin in db if not exists
  const userInfo: any = await UserDB.findUser({
    email: new RegExp(Config.get("superAdminEmail"), "i"),
  });
  if (!userInfo) {
    let passwordHash: string = await hashBassword(
      Config.get("superAdminPassword")
    );
    const data: UserData = {
      name: "abdulaziz qannam",
      email: Config.get("superAdminEmail"),
      password: passwordHash,
      role: "SM",
      verified: true,
    };
    await UserDB.createUser(data);
  }
};
export const initializeTrelloMembers = async () => {
  try {
    // let members = await TrelloController.__getAllMembers();
  } catch (error) {
    logger.error({ error });
  }
};

export const initializeTrelloBoards = async () => {
  try {
    let allBoards: Board[],
      allDepartments: IDepartmentState[],
      listTypes: string[],
      listExisted: {
        id: string;
        name: string;
      },
      boardsIds: string[],
      depsIds: string[],
      notExistedOnTTP: Board[],
      notExistedOnTrello: IDepartmentState[],
      intersection: IDepartmentState[];
    let newDeps: IDepartmentState[] = [];

    allBoards = await TrelloController.getBoardsInTrello("open");
    boardsIds = allBoards?.map((item) => item.id);
    allDepartments = await Department.find({});

    depsIds = allDepartments?.map((item) => item.boardId);

    intersection = allDepartments.filter((item) =>
      boardsIds?.includes(item.boardId)
    );

    // Not Existed on Trello > create it on trello

    notExistedOnTrello = allDepartments.filter(
      (item) => !boardsIds.includes(item.boardId)
    );
    notExistedOnTrello = await Promise.all(
      await notExistedOnTrello.map(async (item) => {
        let board = await TrelloController.createNewBoard(
          item.name,
          item.color
        );
        item.boardId = board.id;
        listTypes = ListTypes;
        await Promise.all(
          listTypes?.map(async (list) => {
            let listInBoard = await TrelloController.addListToBoard(
              board.id,
              list
            );
            let listInDepIndex = item.lists.findIndex((i) => i.name === list);
            item.lists[listInDepIndex].listId = listInBoard.id;
          })
        );
        await Promise.all(
          item.teams
            .filter((t) => t.isDeleted === false)
            ?.map(async (team, index) => {
              let teamInBoard = await TrelloController.addListToBoard(
                board.id,
                team.name
              );
              item.teams[index].listId = teamInBoard.id;
            })
        );
        await Promise.all(
          item.sideLists.map(async (list, index) => {
            let teamInBoard = await TrelloController.addListToBoard(
              board.id,
              list.name
            );
            item.sideLists[index].listId = teamInBoard.id;
          })
        );
        return item;
      })
    )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log({ notExistedOnTrelloError: err });
        return [];
      });

    allDepartments = allDepartments?.map((item) => {
      let index = _.findIndex(notExistedOnTrello, { _id: item._id });
      return index >= 0 ? notExistedOnTrello[index] : item;
    });

    // // Not Existed on TTP > create it on TTP
    notExistedOnTTP = allBoards.filter((item) => !depsIds.includes(item.id));
    newDeps = await Promise.all(
      await notExistedOnTTP?.map(async (item) => {
        let lists: List[] = await TrelloController.__getBoardLists(item.id);
        item.lists = lists;
        listTypes = ListTypes;
        let teams = lists.filter((item) => !listTypes.includes(item.name));
        return new Department({
          boardId: item.id,
          name: item.name,
          color: "blue",
          lists: await Promise.all(
            listTypes?.map(async (listName) => {
              listExisted = item?.lists?.find((list) => listName === list.name);
              let listId =
                listExisted?.id ??
                (await TrelloController.addListToBoard(item.id, listName))?.id;
              return {
                name: listName,
                listId: listId,
              };
            })
          ),
          // in case of creating any MAIN list (Main > Tasks Board) ,
          // and for any reason this list wasn't created by the webhook of trello as a sideList.
          // In the next initialization time it will be considered as a Team.
          teams: teams?.map((tem) => {
            return { name: tem.name, listId: tem.id, isDeleted: tem.closed };
          }),
        });
      })
    )
      .then((res: IDepartment[]) => {
        return res;
      })
      .catch((err) => {
        return [];
      })
      .finally(() => {
        return [];
      });

    // existed on TTP & TRELLO > make it same
    intersection = await Promise.all(
      intersection?.map(async (item) => {
        let board = allBoards?.find((board) => board.id === item.boardId);
        board.lists = await TrelloController.__getBoardLists(board.id);
        listTypes = ListTypes;
        item.name = board.name;
        item.boardId = board.id;
        item.lists = await Promise.all(
          listTypes?.map(async (listName) => {
            let listExisted = board?.lists?.find(
              (list) => listName === list.name && list.closed === false
            );
            let list = item.lists.find((i) => i.name === listName);
            let listId = listExisted
              ? listExisted.id
              : (await TrelloController.addListToBoard(board.id, listName)).id;
            list.listId = listId;
            return list;
          })
        );

        let sideListsIds = item.sideLists.map((i) => i.listId);
        let teamsLists = board.lists?.filter(
          (item) =>
            !listTypes.includes(item.name) && !sideListsIds.includes(item.id)
        );
        teamsLists?.forEach((list) => {
          let teamIndex = item.teams.findIndex((i) => i.listId === list.id);
          if (teamIndex >= 0) {
            item.teams[teamIndex].isDeleted = list.closed;
            item.teams[teamIndex].name = list.name;
          } else {
            item.teams.push({
              name: list.name,
              listId: list.id,
              isDeleted: list.closed,
            });
          }
        });

        item.sideLists = await Promise.all(
          item.sideLists.map(async (sideI) => {
            let listExisted = board.lists.find(
              (i) => i.id === sideI.listId && i.closed === false
            );
            let listID = listExisted
              ? listExisted.id
              : (await TrelloController.addListToBoard(board.id, sideI.name))
                  .id;
            sideI.listId = listID;
            return sideI;
          })
        );
        return item;
      })
    )
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return [];
      })
      .finally(() => {
        return [];
      });

    allDepartments = allDepartments?.map((item) => {
      let index = intersection.findIndex((dep) => dep._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });

    let creativeBoard = allDepartments.find(
      (i) => i.name === Config.get("CreativeBoard")
    );
    if (!creativeBoard && !creativeBoard.name)
      await createTTPCreativeMainBoard();

    let update = [
      ...allDepartments?.map((item) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: {
              name: item.name,
              boardId: item.boardId,
              color: item.color,
              teams: item.teams,
              lists: item.lists,
              sideLists: item?.sideLists,
            },
            upsert: true,
          },
        };
      }),
      ...newDeps?.map((item) => {
        return {
          insertOne: {
            document: item,
          },
        };
      }),
    ];

    Department.bulkWrite(update, {}).catch((err) => {
      console.log({ err: err.writeErrors[0].err });
    });
    allDepartments.forEach(async (item) =>
      TrelloController.__addWebHook(item.boardId, "trelloWebhookUrlTask")
    );
  } catch (error) {
    logger.error({ initializeTrelloBoardsError: error });
  }
};

export const initializeTTPTasks = async () => {
  try {
    let tasks: TaskInfo[],
      boards: Board[],
      departments: IDepartment[],
      creativeDepartment: IDepartment,
      projectsListId: string,
      cards: Card[],
      cardsIds: string[],
      tasksIds: string[],
      intersection: TaskInfo[],
      notExistedOnTrello: TaskInfo[],
      notExistedOnTTP: Card[];

    // get the data
    boards = await TrelloController.getBoardsInTrello("all");
    boards = await Promise.all(
      boards?.map(async (item) => {
        let lists: List[] = await TrelloController.__getBoardLists(item.id);
        item.lists = lists;
        return item;
      })
    );
    departments = await Department.find({});
    tasks = await Tasks.find({});
    cards = _.flattenDeep(
      await Promise.all(
        boards?.map(async (item) => {
          let boardCards: Card[] = await TrelloController.__getCardsInBoard(
            item.id
          );
          return boardCards;
        })
      )
    );
    cards = await Promise.all(
      cards?.map(async (item) => {
        let attachments = await TrelloController.__getCardAttachments(item.id);
        item.attachments = attachments ?? [];
        return item;
      })
    );
    tasksIds = tasks?.map((item) => item.cardId);
    cardsIds = cards?.map((item) => item.id);
    notExistedOnTTP = cards.filter((item) => !tasksIds.includes(item.id));
    notExistedOnTrello = tasks.filter(
      (item) => !cardsIds.includes(item.cardId)
    );
    intersection = tasks.filter((item) => cardsIds.includes(item.cardId));

    // processing
    // Tasks Plugins
    // Existed on TTP & Trello > make it same
    intersection = await Promise.all(
      intersection?.map(async (item: TaskInfo) => {
        let card: Card = cards?.find((c) => c.id === item.cardId);
        let isBoardArchived =
          boards.find((i) => i.id === card.idBoard)?.closed === true
            ? true
            : false ?? true;
        let isListArchived =
          boards
            ?.find((i) => i.id === card.idBoard)
            ?.lists?.find((l) => l.id === card.idList)?.closed === true
            ? true
            : false ?? true;
        let dep = departments?.find((d) => d.boardId === card?.idBoard);
        let status =
          isBoardArchived || isListArchived
            ? null
            : dep?.lists?.find((list) => list?.listId === card?.idList);
        let team =
          isBoardArchived || isListArchived
            ? null
            : dep?.teams?.find((team) => team?.listId === card?.idList);
        let sideList =
          isBoardArchived || isListArchived
            ? null
            : dep?.sideLists.find(
                (sideList) => sideList?.listId === card.idList
              );
        let { movements, currentTeam, createdAt } =
          await TrelloController.getActionsOfCard(
            card.id,
            departments,
            card.due ? new Date(card.due) : null
          );
        let replacement = new Tasks({
          _id: item._id,
          name: card.name,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          boardId: card.idBoard,
          projectId: item.projectId,
          listId: card.idList,
          status: sideList
            ? "Tasks Board"
            : status
            ? status.name
            : team
            ? "In Progress"
            : "",
          teamId: team?._id ?? currentTeam?._id ?? item.teamId ?? null,
          teamListId:
            team?.listId ?? currentTeam?.listId ?? item.teamListId ?? null,
          cardId: card.id,
          description: card.desc ?? item.description ?? "",
          start: card.start,
          deadline: card.due ?? null,
          trelloShortUrl: card.shortUrl ?? "",
          archivedCard: isBoardArchived || isListArchived || card.closed,
          movements:
            isBoardArchived || isListArchived || card.closed ? [] : movements,
          attachedFiles:
            card?.attachments?.length > 0
              ? card?.attachments?.map((item) => {
                  return {
                    name: item.fileName,
                    trelloId: item.id,
                    mimeType: item.mimeType,
                    url: item.url,
                  };
                })
              : [],
          cardCreatedAt: new Date(createdAt),
        });
        return replacement;
      })
    );

    tasks = tasks?.map((item) => {
      let index = intersection?.findIndex((task) => task._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });
    // // not Existed on TTP > create it on TTP
    let newTasks = await Promise.all([
      ...notExistedOnTTP?.map(async (card) => {
        let isBoardArchived =
          boards.find((i) => i.id === card.idBoard)?.closed === true
            ? true
            : false ?? true;
        let isListArchived =
          boards
            .find((i) => i.id === card.idBoard)
            ?.lists?.find((l) => l.id === card.idList)?.closed === true
            ? true
            : false ?? true;

        let dep =
          isBoardArchived || isListArchived
            ? null
            : departments?.find((d) => d.boardId === card.idBoard);
        let status =
          isBoardArchived || isListArchived
            ? null
            : dep?.lists?.find((list) => list.listId === card.idList);
        let team =
          isBoardArchived || isListArchived
            ? null
            : dep?.teams?.find((team) => team.listId === card.idList);
        let sideList =
          isBoardArchived || isListArchived
            ? null
            : dep?.sideLists.find(
                (sideList) => sideList?.listId === card.idList
              );
        let { movements, currentTeam, createdAt } =
          await TrelloController.getActionsOfCard(
            card.id,
            departments,
            card.due ? new Date(card.due) : null
          );
        let task: TaskInfo = new Tasks({
          name: card.name,
          boardId: card.idBoard,
          listId: card.idList,
          status: sideList
            ? "Tasks Board"
            : status
            ? status.name
            : team
            ? "In Progress"
            : "",
          teamId: team?._id ?? currentTeam?._id ?? null,
          teamListId: team?.listId ?? currentTeam?.listId ?? null,
          cardId: card.id,
          description: card?.desc ?? "",
          start: card?.start ?? null,
          deadline: card?.due ?? null,
          trelloShortUrl: card?.shortUrl,
          archivedCard: isBoardArchived || isListArchived || card.closed,
          attachedFiles: card?.attachments?.length
            ? card?.attachments?.map((item) => {
                return {
                  name: item?.fileName,
                  trelloId: item?.id,
                  mimeType: item?.mimeType,
                  url: item?.url,
                };
              })
            : [],
          movements:
            isBoardArchived || isListArchived || card?.closed ? [] : movements,
          cardCreatedAt: new Date(createdAt),
        });
        logger.debug({ cardCreatedAt: createdAt });
        return task;
      }),
    ]);

    notExistedOnTrello = notExistedOnTrello.filter(
      (i) => i.archivedCard === false
    );

    let creativeBoard = boards.find(
      (board) => board.name === Config.get("CreativeBoard")
    );

    notExistedOnTrello = await Promise.all(
      notExistedOnTrello?.map(async (item) => {
        item.archivedCard = true;
        return item;
      })
    );
    notExistedOnTrello = notExistedOnTrello.filter((i) => i !== null);

    tasks = tasks?.map((item) => {
      let index = notExistedOnTrello.findIndex((i) => i._id === item._id);
      return index >= 0 ? notExistedOnTrello[index] : item;
    });

    let update = [
      ...newTasks?.map((item) => {
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
              start: item.start ? item.start : null,
              deadline: item.deadline,
              cardId: item.cardId,
              boardId: item.boardId,
              description: item?.description ? item.description : "",
              trelloShortUrl: item.trelloShortUrl,
              attachedFiles: item.attachedFiles,
              movements: item.movements,
              archivedCard: item.archivedCard,
              cardCreatedAt: item.cardCreatedAt,
            },
          },
        };
      }),
    ];
    Tasks.bulkWrite(update, {});
    console.log("update hooks");
    tasks.forEach(async (item) => {
      TrelloController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
    });
  } catch (error) {
    logger.error({ initializeTTPTasksError: error });
  }
};

export const initializeCardsPlugins = async () => {
  try {
    let departments = await Department.find({});
    let boardIds = departments.map((department) => department.boardId);
    let cards = _.flattenDepth(
      await Promise.all(
        boardIds.map(async (id) => {
          let boardCards: Card[] = await TrelloController.__getCardsInBoard(id);
          return boardCards;
        })
      )
    );

    let tasks = await TaskController.getTasks({ archivedCard: false });
    let tasksPlugins = await TasksPlugins.find({});
    if (tasks) {
      let plugins = await Promise.all(
        tasks.map(async (item) => {
          let commentsActions: TrelloAction[] =
            await TrelloController.getComments(item.cardId);
          let comments = await Promise.all(
            commentsActions.map((i) => {
              return { comment: i.data.text };
            })
          );
          let checkLists: CheckList[] = await TrelloController.getChecklists(
            item.cardId
          );
          let labels = cards.find((i) => i.id === item.cardId).labels;
          let existed = tasksPlugins.find((i) => i.cardId === item.cardId);
          if (existed) {
            existed.taskId = item._id;
            existed.cardId = item.cardId;
            existed.name = item.name;
            existed.checkLists = checkLists;
            existed.comments = comments;
            existed.labels = labels;
            return existed;
          } else
            return new TasksPlugins({
              name: item.name,
              taskId: item._id.toString(),
              cardId: item.cardId,
              checkLists: checkLists,
              comments: comments,
              labels: labels,
            });
        })
      );
      let update = [
        ...plugins.map((pluginCard) => {
          return {
            replaceOne: {
              filter: { _id: pluginCard._id.toString() },
              replacement: {
                name: pluginCard.name,
                cardId: pluginCard.cardId,
                taskId: pluginCard.taskId,
                comments: pluginCard.comments,
                checkLists: pluginCard.checkLists,
                labels: pluginCard.labels,
              },
              upsert: true,
            },
          };
        }),
      ];
      TasksPlugins.bulkWrite(update);
      return update;
    }
  } catch (error) {
    logger.error({ initializeCardsPluginsError: error });
  }
};

export const createTTPCreativeMainBoard = async () => {
  try {
    let dep: any = {
      name: Config.get("CreativeBoard"),
      color: "orange",
    };
    let department = await DepartmentController.createDepartment(dep);
  } catch (error) {
    logger.error({ createTTPCreativeMainBoardError: error });
  }
};

export default mongoDB;
