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
import {
  IDepartment,
  IDepartmentState,
  ITeam,
} from "../../types/model/Department";
import {
  Board,
  Card,
  TrelloAction,
  List,
  CheckList,
} from "../../types/controller/trello";
import { ListTypes } from "../../types/model/Department";
import _, { create } from "lodash";
import { Movement, TaskInfo } from "../../types/model/tasks";
import Tasks from "../../models/Task";
import TaskController from "../../controllers/task";
import { AnyBulkWriteOperation } from "mongodb";
import TasksPlugins from "../../models/TaskPlugins";
import { delay } from "../../services/validation";
import { intializeTaskQueue } from "../../backgroundJobs/actions/init.actions.queue";
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

// should be inside the authUser controller
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

// should be inside the Departments Controller
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
        let department = new Department({
          name: item.name,
          color: "blue",
          teams: item.lists
            .filter((l) => !ListTypes.includes(l.name))
            .map((item) => {
              return {
                listId: item.id,
                name: item.name,
                isDeleted: item.closed,
              };
            }),
          lists: item.lists
            .filter((l) => ListTypes.includes(l.name))
            .map((l) => {
              return {
                name: l.name,
                listId: l.id,
              };
            }),
          boardUrl: item.url,
          boardId: item.id,
        });
        let result = await department.createDepartmentValidate();
        if (!result.error) return department;
        else {
          let lists = await department.updateLists();
          department.lists = lists;
          return department;
        }
      })
    );

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
    );

    allDepartments = allDepartments?.map((item) => {
      let index = intersection.findIndex((dep) => dep._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });

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
              sideLists: item.sideLists,
            },
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
    await Department.bulkWrite(update)
      .then((res) => {
        console.log({ bulkUpdateDepartmentsResult: res });
      })
      .catch((error) => {
        console.log({ bulkUpdateDepartmentsError: error });
      });
    allDepartments.forEach(async (item) =>
      TrelloController.__addWebHook(item.boardId, "trelloWebhookUrlTask")
    );
  } catch (error) {
    logger.error({ initializeTrelloBoardsError: error });
  }
};

export const initializeCardsPlugins = async () => {
  try {
    let departments = await Department.find({});
    let boardIds = departments.map((department) => department.boardId);
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    let cards = _.flattenDeep(
      await Promise.all(
        boardIds.map(async (id, index) => {
          if (index != 0) {
            delay(2000);
            console.log({ boardId: id, index });
          }
          let boardCards: Card[] = await TrelloController.__getCardsInBoard(id);
          return boardCards;
        })
      )
    );

    let tasks = await TaskController.getTasks({ archivedCard: false });
    let tasksPlugins = await TasksPlugins.find({});

    if (tasks) {
      let plugins = await Promise.all(
        tasks.map(async (item, index) => {
          if (index !== 0) {
            delay(2000);
            console.log({ cardIdForPlugins: item.cardId, index });
          }
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

      let result = await TasksPlugins.bulkWrite(update);
      return result;
    }
  } catch (error) {
    logger.error({ initializeCardsPluginsError: error });
  }
};
export default mongoDB;
