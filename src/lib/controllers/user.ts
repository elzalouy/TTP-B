import sendMail from "../services/mail/mail";
import logger from "../../logger";
import UserDB from "../dbCalls/user/user";
import { customeError } from "../utils/errorUtils";
import { JwtPayload } from "jsonwebtoken";
import { GetUserData } from "./../types/controller/user";
import { passwordCheck, emailCheck } from "./../utils/validation";
import { IUser, PasswordUpdate, UserData } from "../types/model/User";
import {
  hashBassword,
  comparePassword,
  createJwtToken,
  jwtVerify,
} from "../services/auth";

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

  static async getUsers(data: GetUserData) {
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
      let token = await createJwtToken(user);
      await sendMail({
        email: user.email,
        subject:
          "This is a reminder to set a New Password for your TTP account",
        token: token,
        path: "newPassword",
        image:
          "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
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

      if (!token.id) {
        return customeError("not_valid_token", 400);
      }

      if (passwordCheck(password)) {
        return customeError("password_length", 400);
      }

      let findUser = await super.findUserById(token.id);
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
        id: token.id,
        password: passwordHash,
        verified: true,
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
      if (!token.id) {
        return customeError("not_valid_token", 400);
      }

      if (passwordCheck(password)) {
        console.log("password pattern error");
        return customeError("password_length", 400);
      }

      let findUser = await super.findUserById(token.id);
      if (!findUser) {
        console.log("user not existed error");
        return customeError("user_not_exist", 409);
      }

      // hash password
      let passwordHash: string = await hashBassword(password);
      let user = await super.updateUser({
        id: token.id,
        password: passwordHash,
        verified: true,
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
      let token = await createJwtToken(findUser);
      if (data.email) {
        sendMail({
          email: data.email,
          subject: "Please set your new password",
          token: token,
          path: "newPassword",
          image:
            "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
        });
      }

      return await super.updateUser({
        ...data,
        verified: false,
        password: null,
      });
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
      const { email } = data;

      if (!emailCheck(email)) {
        return customeError("email_error", 400);
      }

      let findUser = await super.findUser({
        email: new RegExp(email, "i"),
      });
      if (findUser) {
        return customeError("user_already_exist", 400);
      }

      let newUser = await super.createUser({
        ...data,
      });

      let token = await createJwtToken(newUser);

      sendMail({
        email: email,
        subject: "Please update your new password",
        token: token,
        path: "newPassword",
        image:
          "http://drive.google.com/uc?export=view&id=1bfh1fwvqg9JegwTghhuYWIhUS0wGIryj",
      });

      return newUser;
    } catch (error) {
      logger.error({ addNewUserError: error });
    }
  }
};

export default UserController;
