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
import { createProjectsCardsInCreativeBoard } from "../../backgroundJobs/actions/department.actions.queue";
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
    initializeCreativeBoard();
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
      process.env.SUPER_ADMIN_PASSWORD
    );

    const data: UserData = {
      name: "abdulaziz qannam",
      email: Config.get("superAdminEmail"),
      password: Config.get("superAdminPassword"),
      role: "SM",
      verified: true,
    };
    await UserDB.createUser(data);
  }
};
const initializeCreativeBoard = async () => {
  let department = await Department.findOne({
    name: Config.get("CreativeBoard"),
  });
  let projects = await ProjectController.getProject({});
  if (!department) {
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
};
export default mongoDB;
