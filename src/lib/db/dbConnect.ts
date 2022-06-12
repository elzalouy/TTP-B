import { hashBassword } from "../services/auth";
import { connect, ConnectOptions } from "mongoose";
import { config } from "dotenv";
import logger from "../../logger";
import { UserData } from "../types/model/User";
import UserDB from "../dbCalls/user/user";
import Config from "config";
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
        role: "OM",
      };
      await UserDB.createUser(data);

      console.log("Done");
    }
  } catch (error) {
    console.error({ mongoDBError: error });
    process.exit(1);
  }
};

export default mongoDB;
