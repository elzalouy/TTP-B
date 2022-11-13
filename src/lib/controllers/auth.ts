import { passwordCheck } from "./../utils/validation";
import { successMsg } from "./../utils/successMsg";
import { UserData } from "./../types/model/User";
import { AuthSignIn, TokenAndUser } from "./../types/controller/auth";
import {
  comparePassword,
  createJwtToken,
  jwtVerify,
  hashBassword,
} from "../services/auth";
import logger from "../../logger";
import UserDB from "../dbCalls/user/user";
//NodeMailer
import sendMail from "../services/mail/mail";
import { customeError } from "../utils/errorUtils";
import { JwtPayload } from "jsonwebtoken";

const AuthController = class AuthController extends UserDB {
  static async signInUser(data: AuthSignIn) {
    return await AuthController.__signIn(data);
  }

  static async forgetUserPassword(email: string) {
    return await AuthController.__forgetPassword(email);
  }

  static async setNewPassword(token: string, password: string) {
    return await AuthController.__newPasswordSet(token, password);
  }

  static async __newPasswordSet(token: string, password: string) {
    try {
      let verifyToken: JwtPayload = await jwtVerify(token);
      if (!verifyToken) {
        return customeError("not_valid_token", 400);
      }
      console.log({ password, verifyToken });
      let checkPassword = passwordCheck(password);
      if (checkPassword) {
        return customeError("password_length", 400);
      }
      let cryptPassword = await hashBassword(password);
      let user = await super.updateUser({
        id: verifyToken.id,
        password: cryptPassword,
        verified: true,
      });
      return { user, status: 200 };
    } catch (error) {
      logger.error({ setNewPasswordError: error });
    }
  }

  static async __forgetPassword(email: string) {
    try {
      let user = await super.findUser({ email });
      if (!user) {
        return customeError("no_user_found", 400);
      }
      let token = await createJwtToken(user);
      await sendMail({
        token: token,
        email: email,
        subject: "Forgot Password : Reset your old password",
        path: "resetPassword",
        image:
          "http://drive.google.com/uc?export=view&id=1F7ef1MmFkhOOOwPsYjPu-YT9ab51jR1s",
      });
      return successMsg("email_sent", 200);
    } catch (error) {
      logger.error({ forgetUserPasswordError: error });
    }
  }

  static async __signIn(data: AuthSignIn): Promise<any> {
    try {
      const { email, password } = data;
      console.log({ email, password });
      let user = await super.findUser({ email });
      if (!user || user.verified === false) {
        console.log({ notVerfied: true });
        return null;
      }
      let passwordCheck = await comparePassword(password, user.password);
      console.log({ passwordCheck });
      if (passwordCheck === false) {
        return null;
      }
      let getToken = createJwtToken(user);
      console.log({ getToken });
      let {
        _id,
        email: mail,
        role,
        type,
        image,
        trelloBoardId,
        trelloMemberId,
        name,
      } = user;
      console.log({ user });
      return {
        _id,
        email: mail,
        role,
        type,
        image,
        name,
        trelloBoardId,
        trelloMemberId,
        token: getToken,
      };
    } catch (error) {
      logger.error({ signInError: error });
    }
  }
};

export default AuthController;
