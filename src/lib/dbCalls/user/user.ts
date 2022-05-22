import { GetUserData } from "./../../types/controller/user";
import { IUser, UserData } from "../../types/model/User";
import logger from "../../../logger";
import User from "../../models/User";

const UserDB = class UserDB {
  static async findUser(data: Object) {
    return await this.__getUserData(data);
  }

  static async createUser(data: UserData) {
    return await this.__createNewUser(data);
  }

  static async updateUser(data: Object) {
    return await this.__updateUserInfo(data);
  }

  static async findUserById(id: string) {
    return await this.__findById(id);
  }

  static async deleteUser(id: string) {
    return await this.__deleteUserData(id);
  }

  static async getUsers(data: GetUserData) {
    return await this.__getUsersData(data);
  }

  static async __getUsersData(data: GetUserData) {
    try {
      let user = await User.find(data).lean();
      return user;
    } catch (error) {
      logger.error({ getUserError: error });
    }
  }

  static async __deleteUserData(id: string) {
    try {
      let deleteUser = await User.findOneAndDelete({ _id: id });
      return deleteUser;
    } catch (error) {
      logger.error({ deleteUserError: error });
    }
  }

  static async __updateUserInfo(data: UserData) {
    try {
      let id = data.id;
      delete data.id;
      let user: IUser = await User.findOneAndUpdate(
        { _id: id },
        { ...data },
        { new: true, lean: true }
      );
      return user;
    } catch (error) {
      logger.error({ updateUserDataError: error });
    }
  }

  static async __findById(id: string) {
    try {
      let user: IUser = await User.findById({ _id: id }).lean();
      return user;
    } catch (error) {
      logger.error({ findUserById: error });
    }
  }

  static async __getUserData(data: Object) {
    try {
      let user: IUser = await User.findOne({ ...data })
      .lean();
      return user;
    } catch (error) {
      logger.error({ findUserError: error });
    }
  }

  static async __createNewUser(data: UserData) {
    try {
      let user: IUser = new User(data);
      await user.save();
      return user;
    } catch (error) {
      logger.error({ createUserError: error });
    }
  }
};

export default UserDB;
