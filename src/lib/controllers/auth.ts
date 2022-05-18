import { passwordCheck } from "./../utils/validation";
import { successMsg } from "./../utils/successMsg";
import { UserData } from "./../types/model/User";
import { AuthSignIn, TokenAndUser } from "./../types/controller/auth";
import {
  comparePassword,
  createJwtToken,
  jwtVerify,
  hashBassword,
} from "./../services/auth/auth";
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
      if (!verifyToken.user) {
        return customeError("not_valid_token", 400);
      }
      let checkPassword = passwordCheck(password);
      if (checkPassword) {
        return customeError("password_length", 400);
      }
      let cryptPassword = await hashBassword(password);
      let user = await super.updateUser({
        id: verifyToken.user.id,
        password: cryptPassword,
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
      let token = await createJwtToken(user._id.toString());
      await sendMail({
        token: token,
        email: email,
        body: "Please click on this link to reset your password",
        subject: "Forgot Password",
        path: "resetPassword",
      });
      return successMsg("email_sent", 200);
    } catch (error) {
      logger.error({ forgetUserPasswordError: error });
    }
  }

  static async __signIn(data: AuthSignIn): Promise<TokenAndUser> {
    try {
      const { email, password } = data;
      let user = await super.findUser({ email });
      if (!user) {
        return { userData: false, token: false };
      }
      logger.info({ user });
      let passwordCheck = await comparePassword(password, user.password);
      if (!passwordCheck) {
        return { userData: false, token: false };
      }
      let getToken = createJwtToken(user._id.toString());
      return { userData: user, token: getToken };
    } catch (error) {
      logger.error({ signInError: error });
    }
  }
};

export default AuthController;
