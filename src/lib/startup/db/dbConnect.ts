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
import { createProjectsCardsInCreativeBoard } from "../../backgroundJobs/actions/department.actions.queue";
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
      boardsIds.includes(item.boardId)
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
        listTypes =
          item.name === Config.get("CreativeBoard")
            ? CreativeListTypes
            : ListTypes;
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
          item.teams?.map(async (team) => {
            let teamInBoard = await TrelloActionsController.addListToBoard(
              board.id,
              team.name
            );
            team.listId = teamInBoard.id;
            return team;
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
        listTypes =
          item.name === Config.get("CreativeBoard")
            ? CreativeListTypes
            : ListTypes;
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
          teams: teams?.map((tem) => {
            return { name: tem.name, listId: tem.id, isDeleted: false };
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
        listTypes =
          item.name === Config.get("CreativeBoard")
            ? CreativeListTypes
            : ListTypes;
        item.lists = await Promise.all(
          listTypes?.map(async (listName) => {
            let listExisted = board?.lists?.find(
              (list) => listName === list.name
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
        item.teams = board.lists
          ?.filter((item) => !listTypes.includes(item.name))
          ?.map((item) => {
            return { name: item.name, listId: item.id, isDeleted: false };
          });
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
              filter: { _id: item._id, "lists._id": list._id },
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
    let update = [
      ...updateLists,
      ...updateTeams,
      ...allDepartments?.map((item) => {
        return {
          updateOne: {
            filter: { _id: item._id },
            update: {
              name: item.name,
              boardId: item.boardId,
              color: item.color,
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
    console.log({ allDepartments, update, teams: allDepartments[0].teams });
    await Department.bulkWrite(update);
    await allDepartments.forEach(
      async (item) =>
        await TrelloActionsController.__addWebHook(
          item.boardId,
          "trelloWebhookUrlTask"
        )
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
      creativeBoard: Board,
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
    creativeBoard = boards?.find(
      (item) => item.name === Config.get("CreativeBoard")
    );
    tasks = await Tasks.find({});
    creativeDepartment = await Department.findOne({
      boardId: creativeBoard?.id,
    });
    projectsListId = creativeDepartment?.lists?.find(
      (item) => item.name === "projects"
    )?._id;
    let newCards = await Promise.all(
      boards?.map(async (item) => {
        let boardCards: Card[] =
          await TrelloActionsController.__getCardsInBoard(item.id);
        if (item.name === Config.get("CreativeBoard")) {
          let list = item?.lists?.find((l) => l.name === "projects").id;
          boardCards = boardCards.filter((item) => item.idList !== list);
        }
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
      (item) => !cardsIds.includes(item.cardId)
    );
    intersection = tasks.filter((item) => cardsIds.includes(item.cardId));
    // execute the function
    // Existed on TTP & Trello > make it same
    intersection = await Promise.all(
      intersection?.map(async (item) => {
        let card = cards?.find((c) => c.id === item.cardId);
        let dep = departments?.find((d) => d.boardId === card.idBoard);
        let status = dep.lists?.find((list) => list.listId === card.idList);
        let team = dep.teams?.find((team) => team.listId === card.idList);
        let replacement = new Tasks({
          _id: item._id,
          name: item.name,
          categoryId: item.categoryId,
          subCategoryId: item.subCategoryId,
          boardId: card.idBoard,
          projectId: item.projectId,
          listId: card.idList,
          status: status?.name ?? "In Progress",
          teamId: team?._id ?? item.teamId,
          teamListId: team?.listId ?? item?.teamListId,
          cardId: card.id,
          description: card.desc ? card.desc : "",
          start: card.start,
          deadline: card.due ? card.due : null,
          trelloShortUrl: card.shortUrl ? card.shortUrl : "",
          movements:
            item?.movements?.length > 0
              ? item.movements
              : [
                  {
                    movedAt: new Date(Date.now()).toString(),
                    status: status.name ? status.name : "In Progress",
                  },
                ],
          attachedFiles: card?.attachments?.map((item) => {
            return {
              name: item.fileName,
              trelloId: item.id,
              mimeType: item.mimeType,
              url: item.url,
            };
          }),
        });
        return replacement;
      })
    );
    tasks = tasks?.map((item) => {
      let index = intersection?.findIndex((task) => task._id === item._id);
      return index >= 0 ? intersection[index] : item;
    });

    // not Existed on TTP > create it on TTP
    let newTasks = [
      ...notExistedOnTTP?.map((item) => {
        let dep = departments?.find((d) => d.boardId === item.idBoard);
        let status = dep?.lists?.find((list) => list.listId === item.idList);
        let team = dep?.teams?.find((team) => team.listId === item.idList);

        let task: TaskInfo = new Tasks({
          name: item.name,
          boardId: item.idBoard,
          listId: status?.listId ?? team?.listId,
          status: status?.name ?? "In Progress",
          teamId: team?._id ?? null,
          cardId: item.id,
          description: item.desc ?? "",
          start: item.start ? item.start : null,
          deadline: item.due,
          trelloShortUrl: item.shortUrl,
          attachedFiles:
            item.attachments.length > 0
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
              status: status?.name ? status.name : "In Progress",
              movedAt: new Date(Date.now()).toString(),
            },
          ],
        });
        return task;
      }),
    ];
    tasks = [...tasks, ...newTasks];
    // not Existed on Trello > create it on Trello
    notExistedOnTrello = await Promise.all(
      notExistedOnTrello?.map(async (item) => {
        let board = boards?.find((b) => b.id === item.boardId);
        let boardId = board ? board.id : creativeBoard?.id;
        let listId = item.listId;
        let card: Card = await TrelloActionsController.__createCard({
          boardId: boardId,
          listId: listId,
          description: item?.description ? item.description : "",
          deadline: item.deadline,
          start: item?.start,
          name: item.name,
        });
        let replacement = new Tasks({
          _id: item._id,
          boardId: boardId,
          listId: listId,
          movements:
            item?.movements?.length > 0
              ? item.movements
              : [
                  {
                    movedAt: new Date(Date.now()).toString(),
                    status: item.status,
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
      })
    );

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
              deadlineChain: item.deadlineChain,
              movements: item.movements,
            },
          },
        };
      }),
    ];
    Tasks.bulkWrite(update, {});
    await tasks.forEach(async (item) => {
      await TrelloActionsController.__addWebHook(
        item.cardId,
        "trelloWebhookUrlTask"
      );
    });
  } catch (error) {
    logger.error({ error });
  }
};

export const createTTPCreativeMainBoard = async () => {
  try {
    let dep: any = {
      name: Config.get("CreativeBoard"),
      color: "orange",
    };
    let department = await DepartmentController.createDepartment(dep);
    let listOfProjects =
      department &&
      department?.lists &&
      department?.lists?.find((item: any) => item.name === "projects");
    if (department && listOfProjects) {
      createProjectsCardsInCreativeBoard(department);
    }
  } catch (error) {
    logger.error({ createTTPCreativeMainBoardError: error });
  }
};

export default mongoDB;
