import { hashBassword } from "../../services/auth";
import { connect, ConnectOptions } from "mongoose";
import { config } from "dotenv";
import logger from "../../../logger";
import { UserData } from "../../types/model/User";
import UserDB from "../../dbCalls/user/user";
import Config from "config";
import Department from "../../models/Department";
import DepartmentController from "../../controllers/department";
import TrelloActionsController from "../../controllers/trello";
import { IDepartment, IDepartmentState } from "../../types/model/Department";
import { Board, Card, List } from "../../types/controller/trello";
import { CreativeListTypes, ListTypes } from "../../types/model/Department";
import _ from "lodash";
import { TaskInfo } from "../../types/model/tasks";
import Tasks from "../../models/Task";
import { ObjectId } from "mongodb";
import { statusLists } from "../../types/model/tasks";
config();

const db: string = Config.get("mongoDbConnectionString");
logger.info({ db });
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
    // let members = await TrelloActionsController.__getAllMembers();
  } catch (error) {
    logger.error(error);
  }
};

export const initializeTrelloBoards = async () => {
  try {
    let allBoards: Board[],
      allDepartments: IDepartment[],
      listTypes: string[],
      listExisted: {
        id: string;
        name: string;
      },
      boardsIds: string[],
      depsIds: string[],
      notExistedOnTTP: Board[],
      notExistedOnTrello: IDepartment[],
      intersection: IDepartment[];

    allBoards = await TrelloActionsController.getBoardsInTrello();

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
      _.flatMap(notExistedOnTrello, async (item) => {
        let board = await TrelloActionsController.createNewBoard(
          item.name,
          item.color
        );
        item.boardId = board.id;
        listTypes = ListTypes;
        item.lists = await Promise.all(
          item.lists?.map(async (list) => {
            let listInBoard = await TrelloActionsController.addListToBoard(
              board.id,
              list.name
            );
            list.listId = listInBoard.id;
            return list;
          })
        );
        item.teams = await Promise.all(
          item.teams
            .filter((t) => t.isDeleted === false)
            ?.map(async (team) => {
              let teamInBoard = await TrelloActionsController.addListToBoard(
                board.id,
                team.name
              );
              team.listId = teamInBoard.id;
              return team;
            })
        );
        item.sideLists = await Promise.all(
          item.sideLists.map(async (list) => {
            let teamInBoard = await TrelloActionsController.addListToBoard(
              board.id,
              list.name
            );
            list.listId = teamInBoard.id;
            return list;
          })
        );
        return item;
      })
    );

    allDepartments = allDepartments?.map((item) => {
      let index = _.findIndex(notExistedOnTrello, { boardId: item.boardId });
      return index >= 0 ? notExistedOnTrello[index] : item;
    });

    // Not Existed on TTP > create it on TTP
    notExistedOnTTP = allBoards.filter((item) => !depsIds.includes(item.id));
    let newDeps: IDepartment[] = await Promise.all(
      notExistedOnTTP?.map(async (item) => {
        let lists: List[] = await TrelloActionsController.__getBoardLists(
          item.id
        );
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
              return {
                name: listName,
                listId:
                  listExisted && listExisted?.id
                    ? listExisted.id
                    : await TrelloActionsController.addListToBoard(
                        item.id,
                        listName
                      ).then((res: { id: string }) => {
                        return res.id;
                      }),
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
    );

    // existed on TTP & TRELLO > make it same
    intersection = await Promise.all(
      intersection?.map(async (item) => {
        let board = allBoards?.find((board) => board.id === item.boardId);
        board.lists = await TrelloActionsController.__getBoardLists(
          item.boardId
        );
        listTypes = ListTypes;
        item.lists = await Promise.all(
          listTypes?.map(async (listName) => {
            let listExisted = board?.lists?.find(
              (list) => listName === list.name && list.closed === false
            );
            return {
              name: listName,
              listId:
                listExisted && listExisted?.id
                  ? listExisted.id
                  : await TrelloActionsController.addListToBoard(
                      item.boardId,
                      listName
                    ).then((res: { id: string }) => {
                      return res.id;
                    }),
            };
          })
        );
        let sideListsIds = item.sideLists.map((i) => i.listId);
        item.teams = board.lists
          ?.filter(
            (item) =>
              !listTypes.includes(item.name) && !sideListsIds.includes(item.id)
          )
          ?.map((item) => {
            return { name: item.name, listId: item.id, isDeleted: item.closed };
          });
        item.sideLists = await Promise.all(
          item.sideLists.map(async (sideI) => {
            let listExisted = board.lists.find(
              (i) => i.id === sideI.listId && i.closed === false
            );
            return {
              name: sideI.name,
              listId:
                listExisted && listExisted?.id
                  ? listExisted.id
                  : await TrelloActionsController.addListToBoard(
                      item.boardId,
                      sideI.name
                    ),
            };
          })
        );
        return item;
      })
    );

    allDepartments = allDepartments?.map((item) => {
      let index = intersection.findIndex((dep) => dep._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });
    let updateTeams = _.flattenDeep(
      allDepartments?.map((item) => {
        return item.teams?.map((team) => {
          return {
            updateOne: {
              filter: { _id: item._id, "teams.listId": team.listId },
              update: {
                $set: {
                  "teams.$.listId": team.listId,
                  "teams.$.name": team.name,
                  "teams.$.isDeleted": team.isDeleted,
                },
              },
            },
          };
        });
      })
    );
    let updateLists = _.flattenDeep(
      allDepartments?.map((item) => {
        return item.lists?.map((list) => {
          return {
            updateOne: {
              filter: { _id: item._id, "lists.listId": list.listId },
              update: {
                $set: {
                  "lists.$.listId": list.listId,
                  "lists.$.name": list.name,
                },
              },
            },
          };
        });
      })
    );
    let updateSideLists = _.flattenDeep(
      allDepartments.map((item) => {
        return item.sideLists.map((list) => {
          return {
            updateOne: {
              filter: { _id: item._id, "sideLists._id": list._id },
              update: {
                $set: {
                  "sideLists.$.listId": list.listId,
                  "sideLists.$.name": list.name,
                },
              },
            },
          };
        });
      })
    );
    let update = [
      ...allDepartments?.map((item) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: {
              name: item.name,
              boardId: item.boardId,
              color: item.color,
              lists: item.lists,
              teams: item.teams,
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
    Department.bulkWrite(update, {});
    allDepartments.forEach(async (item) =>
      TrelloActionsController.__addWebHook(item.boardId, "trelloWebhookUrlTask")
    );
  } catch (error) {
    logger.error(error);
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
    boards = await TrelloActionsController.getBoardsInTrello();
    boards = await Promise.all(
      boards?.map(async (item) => {
        let lists: List[] = await TrelloActionsController.__getBoardLists(
          item.id
        );
        item.lists = lists;
        return item;
      })
    );
    departments = await Department.find({});
    tasks = await Tasks.find({});
    let newCards = await Promise.all(
      boards?.map(async (item) => {
        let boardCards: Card[] =
          await TrelloActionsController.__getCardsInBoard(item.id);
        return boardCards;
      })
    );
    cards = _.flattenDeep(newCards);
    cards = await Promise.all(
      cards?.map(async (item) => {
        let attachments = await TrelloActionsController.__getCardAttachments(
          item.id
        );
        item.attachments = attachments ?? [];
        return item;
      })
    );
    tasksIds = tasks?.map((item) => item.cardId);
    cardsIds = cards?.map((item) => item.id);
    notExistedOnTTP = cards.filter((item) => !tasksIds.includes(item.id));
    notExistedOnTrello = tasks.filter(
      (item) => !cardsIds.includes(item.cardId) || item.cardId === null
    );
    intersection = tasks.filter((item) => cardsIds.includes(item.cardId));
    console.log({ intersection: intersection.length });
    // execute the function
    // Existed on TTP & Trello > make it same
    intersection = await Promise.all(
      intersection?.map(async (item) => {
        let card = cards?.find((c) => c.id === item.cardId);
        let dep = departments?.find((d) => d.boardId === card?.idBoard);
        let status = dep.lists?.find((list) => list?.listId === card?.idList);
        let team = dep.teams?.find((team) => team?.listId === card?.idList);
        let sideList = dep.sideLists.find(
          (sideList) => sideList.listId === card.idList
        );

        let replacement = new Tasks({
          _id: item._id,
          name: item.name,
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
            : "Tasks Board",
          teamId: team?._id ?? item.teamId,
          teamListId: team?.listId ?? item?.teamListId,
          cardId: card.id,
          description: card.desc ?? item.description ?? "",
          start: card.start,
          deadline: card.due ? card.due : null,
          trelloShortUrl: card.shortUrl ? card.shortUrl : "",
          archivedCard: card.closed,
          movements:
            item?.movements?.length > 0
              ? item.movements
              : [
                  {
                    movedAt: new Date(Date.now()).toString(),
                    status: sideList
                      ? "Tasks Board"
                      : status
                      ? status.name
                      : team
                      ? "In Progress"
                      : "Tasks Board",
                  },
                ],
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
        });
        return replacement;
      })
    );
    tasks = tasks?.map((item) => {
      let index = intersection?.findIndex((task) => task._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });
    console.log({ intersectionAfter: intersection });

    console.log({
      notExistedOnTTP: notExistedOnTTP.length,
      notExistedOnTrello: notExistedOnTrello.length,
    });
    // not Existed on TTP > create it on TTP
    let newTasks = [
      ...notExistedOnTTP?.map((item) => {
        let dep = departments?.find((d) => d.boardId === item.idBoard);
        let status = dep?.lists?.find((list) => list.listId === item.idList);
        let team = dep?.teams?.find((team) => team.listId === item.idList);
        let sideList = dep?.sideLists.find(
          (sideList) => sideList.listId === item.idList
        );
        let task: TaskInfo = new Tasks({
          name: item.name,
          boardId: item.idBoard,
          listId: item.idList,
          status: sideList
            ? "Tasks Board"
            : status
            ? status.name
            : team
            ? "In Progress"
            : "Tasks Board",
          teamId: team?._id ?? null,
          cardId: item.id,
          description: item.desc ?? "",
          start: item.start ? item.start : null,
          deadline: item.due,
          trelloShortUrl: item.shortUrl,
          archivedCard: item.closed,
          attachedFiles: item?.attachments?.length
            ? item?.attachments?.map((item) => {
                return {
                  name: item.fileName,
                  trelloId: item.id,
                  mimeType: item.mimeType,
                  url: item.url,
                };
              })
            : [],
          movements: [
            {
              status: sideList
                ? "Tasks Board"
                : status
                ? status.name
                : team
                ? "In Progress"
                : "Tasks Board",
              movedAt: new Date(Date.now()).toString(),
            },
          ],
        });
        return task;
      }),
    ];
    tasks = [...tasks, ...newTasks];
    console.log({ notExistedOnTTPAfter: tasks.length });
    // not Existed on Trello > create it on Trello
    notExistedOnTrello = await Promise.all(
      notExistedOnTrello
        .filter((i) => i.archivedCard === false)
        ?.map(async (item) => {
          let board = boards?.find((b) => b.id === item.boardId);
          let listId = item.listId;
          if (board) {
            let card: Card = await TrelloActionsController.__createCard({
              boardId: board.id,
              listId: listId,
              description: item?.description ? item.description : "",
              deadline: item.deadline,
              start: item?.start,
              name: item.name,
            });
            let replacement = new Tasks({
              _id: item._id,
              boardId: board.id,
              listId: listId,
              movements:
                item?.movements?.length > 0
                  ? item.movements
                  : [
                      {
                        movedAt: new Date(Date.now()).toString(),
                        status: item?.status,
                      },
                    ],
              name: item.name,
              status: item.status,
              teamId: null,
              cardId: card.id,
              description: item.description,
              start: item.start ? item.start : null,
              deadline: item.deadline,
              trelloShortUrl: card.shortUrl,
              attachedFiles: [],
              projectId: item.projectId,
              categoryId: item.categoryId,
              subCategoryId: item.subCategoryId,
            });
            return replacement;
          } else return null;
        })
    );
    notExistedOnTrello = notExistedOnTrello.filter((i) => i !== null);

    console.log({ notExistedOnTrelloAfter: notExistedOnTrello.length });

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
            },
          },
        };
      }),
    ];
    console.log({ update });
    Tasks.bulkWrite(update, {});
    tasks.forEach(async (item) => {
      TrelloActionsController.__addWebHook(item.cardId, "trelloWebhookUrlTask");
    });
  } catch (error) {
    logger.error({ error });
  }
};

// export const createTTPCreativeMainBoard = async () => {
//   try {
//     let dep: any = {
//       name: Config.get("CreativeBoard"),
//       color: "orange",
//     };
//     let department = await DepartmentController.createDepartment(dep);
//     let listOfProjects =
//       department &&
//       department?.lists &&
//       department?.lists?.find((item: any) => item.name === "projects");
//     if (department && listOfProjects) {
//       createProjectsCardsInCreativeBoard(department);
//     }
//   } catch (error) {
//     logger.error({ createTTPCreativeMainBoardError: error });
//   }
// };

export default mongoDB;
