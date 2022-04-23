import { GetUserData } from "./../types/controller/user";
import { hashBassword, comparePassword } from "./../services/auth/auth";
import { passwordCheck, emailCheck } from "./../utils/validation";
import logger from "../../logger";
import UserDB from "../dbCalls/user/user";
import { IUser, PasswordUpdate, UserData } from "../types/model/User";
import { customeError } from "../utils/errorUtils";
import BoardController from "./boards";

const UserController = class UserController extends UserDB {
  static async addUser(data: UserData) {
    return await UserController.__addNewUser(data);
  }

  static async updateUser(data: UserData) {
    return await UserController.__updateUserData(data);
  }

  static async updatePassword(data: PasswordUpdate) {
    return await UserController.__updateUserPassword(data);
  }

  static async deleteUserInfo(id:string) {
    return await UserController.__deleteUserDoc(id);
  }

  static async getUsersPmOrSA(data: GetUserData) {
    return await UserController.__getUsersInfo(data);
  }

  static async __getUsersInfo(data: GetUserData) {
    try {
      let findUsers = await super.getUsers(data);
      return findUsers;
    } catch (error) {
      logger.error({ getUsersError: error });
    }
  }

  static async __deleteUserDoc(id:string) {
    try {
      let deletedUser = await super.deleteUser(id);
      return deletedUser;
    } catch (error) {
      logger.error({ deleteUserInfoError: error });
    }
  }

  static async __updateUserPassword(data: PasswordUpdate) {
    try {
      const { id, password, oldPassword } = data;

      if (passwordCheck(password)) {
        return customeError("password_length", 400);
      }

      let findUser = await super.findUserById(id);
      if (!findUser) {
        return customeError("user_not_exist", 409);
      }

      let oldPasswordCheck = await comparePassword(
        oldPassword,
        findUser.password
      );
      if (!oldPasswordCheck) {
        return customeError("wrong_old_password", 409);
      }
      // hash password
      let passwordHash: string = await hashBassword(password);

      let user = await super.updateUser({ id, password: passwordHash });
      return user;
    } catch (error) {
      logger.error({ updatePasswordError: error });
    }
  }

  static async __updateUserData(data: UserData) {
    try {
      const { id, email } = data;
      let findUser = await super.findUserById(id);

      if (!findUser) {
        return null;
      }

      return await super.updateUser({ ...data });
    } catch (error) {
      logger.error({ updateUserInfoError: error });
    }
  }

  static async __addNewUser(data: UserData): Promise<
    | {
        msg: string;
        status: number;
      }
    | IUser
  > {
    try {
      const { email/*  password ,trelloBoardId,trelloMemberId,type='admin' */} = data;
      // if (passwordCheck(password)) {
      //   return customeError("password_length", 400);
      // }

      if (!emailCheck(email)) {
        return customeError("email_error", 400);
      }

      let findUser = await super.findUser({ email: email });
      if (findUser) {
        return customeError("user_already_exist", 409);
      }
      // hash password
      // let passwordHash: string = await hashBassword(password);

      // add project manager to specific board
      // if(trelloBoardId &&trelloMemberId && type){
      //      BoardController.addMemberToBoard(trelloBoardId,trelloMemberId,type)
      // }
      
      return await super.createUser({ ...data /* password: passwordHash  */});
    } catch (error) {
      logger.error({ addNewUserError: error });
    }
  }
};

export default UserController;
