import { GetUserData } from "./../types/controller/user";
import {
  hashBassword,
  comparePassword,
  createJwtToken,
  jwtVerify,
} from "../services/auth";
import { passwordCheck, emailCheck } from "./../utils/validation";
import logger from "../../logger";
import UserDB from "../dbCalls/user/user";
import { IUser, PasswordUpdate, UserData } from "../types/model/User";
import { customeError } from "../utils/errorUtils";
import BoardController from "./boards";
import sendMail from "../services/mail";
import { JwtPayload } from "jsonwebtoken";

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

  static async resetPassword(data: PasswordUpdate) {
    return await UserController.__resetUserPassword(data);
  }

  static async deleteUserInfo(id: string) {
    return await UserController.__deleteUserDoc(id);
  }

  static async getUsersPmOrSA(data: GetUserData) {
    return await UserController.__getUsersInfo(data);
  }

  static async getUserById(id: string) {
    return await UserController.__getUser(id);
  }
  static async resendNewUserMail(id: string) {
    return await UserController.__resendNewUserMail(id);
  }

  static async __resendNewUserMail(id: string) {
    try {
      let user = await super.findUserById(id);
      let token = await createJwtToken(user._id.toString());
      await sendMail({
        email: user.email,
        subject:
          "This is a reminder to set a New Password for your TTP account",
        token: token,
        path: "newPassword",
        body: "Please set your new password using this link to start using your account",
      });
    } catch (error) {
      logger.error({ getUsers: error });
    }
  }

  static async __getUser(id: string) {
    try {
      let user = await super.findUserById(id);
      return user;
    } catch (error) {
      logger.error({ getUsers: error });
    }
  }

  static async __getUsersInfo(data: GetUserData) {
    try {
      let findUsers = await super.getUsers(data);
      return findUsers;
    } catch (error) {
      logger.error({ getUsersError: error });
    }
  }

  static async __deleteUserDoc(id: string) {
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

      const token: JwtPayload = await jwtVerify(id);

      if (!token.user) {
        return customeError("not_valid_token", 400);
      }

      if (passwordCheck(password)) {
        return customeError("password_length", 400);
      }

      let findUser = await super.findUserById(token.user.id);
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

      let user = await super.updateUser({
        id: token.user.id,
        password: passwordHash,
      });
      return user;
    } catch (error) {
      logger.error({ updatePasswordError: error });
    }
  }

  static async __resetUserPassword(data: PasswordUpdate) {
    try {
      const { id, password } = data;

      const token: JwtPayload = await jwtVerify(id);

      if (!token.user) {
        return customeError("not_valid_token", 400);
      }

      if (passwordCheck(password)) {
        return customeError("password_length", 400);
      }

      let findUser = await super.findUserById(token.user.id);
      if (!findUser) {
        return customeError("user_not_exist", 409);
      }

      // hash password
      let passwordHash: string = await hashBassword(password);

      let user = await super.updateUser({
        id: token.user.id,
        password: passwordHash,
      });
      return user;
    } catch (error) {
      logger.error({ updatePasswordError: error });
    }
  }

  static async __updateUserData(data: UserData) {
    try {
      const { id } = data;
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
      const { email /* ,trelloBoardId,trelloMemberId,type='admin' */ } = data;
      // if (passwordCheck(password)) {
      //   return customeError("password_length", 400);
      // }

      if (!emailCheck(email)) {
        return customeError("email_error", 400);
      }

      let findUser = await super.findUser({ email: email });
      if (findUser) {
        return customeError("user_already_exist", 400);
      }
      // hash password
      /* let passwordHash: string = await hashBassword(password); */

      // add project manager to specific board
      // if(trelloBoardId &&trelloMemberId && type){
      //      BoardController.addMemberToBoard(trelloBoardId,trelloMemberId,type)
      // }

      let newUser = await super.createUser({
        ...data /* password: passwordHash  */,
      });

      let token = await createJwtToken(newUser._id.toString());

      await sendMail({
        email: email,
        subject: "Update Password",
        token: token,
        path: "newPassword",
        body: "Please set your new password using this link to start using your account",
      });

      return newUser;
    } catch (error) {
      logger.error({ addNewUserError: error });
    }
  }
};

export default UserController;
