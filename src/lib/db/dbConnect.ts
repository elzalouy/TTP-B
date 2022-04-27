import { hashBassword } from "./../services/auth/auth";
import { connect, ConnectOptions } from "mongoose";
import { config } from "dotenv";
import logger from "../../logger";
import { UserData } from "../types/model/User";
import UserDB from "../dbCalls/user/user";
config();

const db: string =
  process.env.NODE_ENV === "development"
    ? process.env.MONGODB_DEV_URL
    : process.env.MONGODB_PROD_URL;
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
    };

    await connect(db, options);
    console.log("Mongo DB connected");

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
        role: "Operation manager",
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
