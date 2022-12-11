import { hashBassword } from "../../services/auth";
import { connect, ConnectOptions } from "mongoose";
import { config } from "dotenv";
import logger from "../../../logger";
import { UserData } from "../../types/model/User";
import UserDB from "../../dbCalls/user/user";
import Config from "config";
import Department from "../../models/Department";
import DepartmentController from "../../controllers/department";
import ProjectController from "../../controllers/project";
import TrelloActionsController from "../../controllers/trello";
import { ProjectData, ProjectInfo } from "../../types/model/Project";
import Tasks from "../../models/Task";
import { createProjectsCardsInCreativeBoard } from "../../backgroundJobs/actions/department.actions.queue";
import { Board, Card, List } from "../../types/controller/trello";
import { CreativeListTypes, ListTypes } from "../../types/model/Department";
import _ from "lodash";
import TaskController from "../../controllers/task";
import { io } from "../../..";
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
    createTTPCreativeMainBoard();
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
export const initializeTrelloBoards = async () => {
  let allBoards: Board[] = await TrelloActionsController.getBoardsInTrello();
  let allDepartments = await Department.find({});
  allBoards.forEach(async (boardItem) => {
    let currentDepartment = allDepartments.find(
      (departmentItem) => departmentItem.boardId === boardItem.id
    );
    let listTypes =
      boardItem.name === Config.get("CreativeBoard")
        ? CreativeListTypes
        : ListTypes;
    if (currentDepartment) {
      // get the lists of the board
      let lists: List[] = await TrelloActionsController.__getBoardLists(
        boardItem.id
      );
      let listsNames = lists.map((item) => item.name);
      let shouldBeExistedInBoard = _.differenceWith(
        listTypes,
        listsNames,
        _.isEqual
      );
      let createShouldBeExisted = await Promise.all(
        shouldBeExistedInBoard.map(async (item) => {
          let list: { id: string } =
            await TrelloActionsController.addListToBoard(boardItem.id, item);
          return { listId: list.id, name: item };
        })
      );
      currentDepartment.lists = [
        ...lists
          .filter((item) => listTypes.includes(item.name))
          .map((item) => {
            return { listId: item.id, name: item.name };
          }),
        ...createShouldBeExisted,
      ];
      currentDepartment.teams = lists
        .filter((item) => !listTypes.includes(item.name))
        .map((item) => {
          return { listId: item.id, name: item.name, isDeleted: false };
        });
      currentDepartment = await currentDepartment.save();
      let cards: Card[] = await TrelloActionsController.__getCardsInBoard(
        currentDepartment.boardId
      );
      let tasks = await TaskController.getAllTasksDB({
        boardId: currentDepartment.boardId,
      });
      let ids = tasks.map((item) => item.cardId);
      let notSavedTasks: Card[] = cards.filter(
        (item) => !ids.includes(item.id)
      );
      let saveTasks = await Promise.all(
        notSavedTasks.map(async (item) => {
          let task = new Tasks({
            name: item.name,
            due: item.due,
            start: item.start,
            description: item.desc,
            listId: item.idList,
            boardId: item.idBoard,
            cardId: item.id,
          });
          return await task.save();
        })
      );
    } else {
      // create the board.
    }
  });
};
export default mongoDB;

export const createTTPCreativeMainBoard = async () => {
  try {
    let department = await Department.findOne({
      name: Config.get("CreativeBoard"),
    });
    let board: Board = await TrelloActionsController.getSingleBoardInfo(
      Config.get("CreativeBoard")
    );
    let projects = await ProjectController.getProject({});
    if (!board && !department) {
      let dep: any = {
        name: Config.get("CreativeBoard"),
        color: "orange",
      };
      department = await DepartmentController.createDepartment(dep);
      let listOfProjects = department.lists.find(
        (item) => item.name === "projects"
      );
      if (department && department?._id && listOfProjects) {
        projects.forEach((item: ProjectData) => {
          TrelloActionsController.__createProject(listOfProjects.listId, item);
        });
      }
    } else {
      createProjectsCardsInCreativeBoard(department);
    }
  } catch (error) {
    logger.error({ createTTPCreativeMainBoardError: error });
  }
};
