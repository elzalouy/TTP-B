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
import { IDepartment } from "../../types/model/Department";
config();

const db: string = Config.get("monogDb");
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
    console.log("Mongo DB connected,", Config.get("monogDb"));

    // adding superAdmin in db if not exists
    const userInfo: any = await UserDB.findUser({
      email: process.env.SUPER_ADMIN_EMAIL,
    });
    if (!userInfo) {
      let passwordHash: string = await hashBassword(
        process.env.SUPER_ADMIN_PASSWORD
      );
      const data: UserData = {
        name: "abdulaziz qannam",
        email: process.env.SUPER_ADMIN_EMAIL,
        password: passwordHash,
        role: "SM",
        verified: true,
      };
      await UserDB.createUser(data);
    }
    let department = await Department.findOne({
      name: new RegExp(Config.get("CreativeBoard"), "i"),
    });
    if (department === null) {
      console.log({ department });
      let dep: any = {
        name: Config.get("CreativeBoard"),
        color: "blue",
      };
      let result: IDepartment = await DepartmentController.createDepartment(
        dep
      );
      let listOfProjects = result.lists.find(
        (item) => item.name.toLocaleLowerCase() === "projects"
      );
      if (result && result?._id) {
        let projects = await ProjectController.getProject({});
        projects.forEach((item: ProjectData) => {
          TrelloActionsController.__createProject(listOfProjects.listId, item);
        });
      }
    }
  } catch (error) {
    console.error({ mongoDBError: error });
    process.exit(1);
  }
};

export default mongoDB;
