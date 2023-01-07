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
import { IDepartmentState } from "../../types/model/Department";
import { createProjectsCardsInCreativeBoard } from "../../backgroundJobs/actions/department.actions.queue";
import {
  Board,
  Card,
  List,
  createBoardResponse,
} from "../../types/controller/trello";
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
  try {
    let allBoards: Board[] = await TrelloActionsController.getBoardsInTrello();
    let allDepartments = await Department.find({});
    if (allBoards?.length > 0) {
      if (!allBoards.find((item) => item.name === Config.get("CreativeBoard")))
        await createTTPCreativeMainBoard();
      allBoards.forEach(async (boardItem, index) => {
        let boardInfo: createBoardResponse =
          await TrelloActionsController.getSingleBoardInfo(boardItem.id);
        boardItem = allBoards[index] = {
          ...allBoards[index],
          lists: await TrelloActionsController.__getBoardLists(boardItem.id),
        };
        let listTypes =
          boardItem.name === Config.get("CreativeBoard")
            ? CreativeListTypes
            : ListTypes;
        let departmentExisted = allDepartments.find(
          (item) => item.boardId === boardItem.id
        );

        let department: IDepartmentState = {
          name: boardItem.name,
          boardId: boardItem.id,
          color: boardInfo.prefs.background,
          lists: await Promise.all(
            listTypes.map(async (listName) => {
              let listExisted = boardItem?.lists?.find(
                (item) => listName === item.name
              );
              return {
                name: listName,
                listId:
                  listExisted && listExisted?.id
                    ? listExisted.id
                    : await TrelloActionsController.addListToBoard(
                        boardItem.id,
                        listName
                      ).then((res: { id: string }) => {
                        return res.id;
                      }),
              };
            })
          ),
          teams: boardItem.lists
            .filter((item) => !listTypes.includes(item.name))
            .map((item) => {
              return { name: item.name, listId: item.id, isDeleted: false };
            }),
        };
        if (!departmentExisted) {
          department = await new Department(department).save();
          await TrelloActionsController.__addWebHook(
            department.boardId,
            "trelloWebhookUrlTask"
          );
        } else {
          let id = departmentExisted._id;
          department = await Department.findOneAndUpdate(
            { _id: id },
            { ...department },
            { new: true }
          );
          await TrelloActionsController.__addWebHook(
            department.boardId,
            "trelloWebhookUrlTask"
          );
        }
        await TaskController.__createNotSavedCardsOnBoard(department);
      });
    } else createTTPCreativeMainBoard();
  } catch (error) {
    logger.error(error);
  }
};
export default mongoDB;

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
