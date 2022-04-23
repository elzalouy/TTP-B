import { GetUserData } from "./../../types/controller/user";
import { successMsg } from "./../../utils/successMsg";
import UserController from "../../controllers/user";
import { Request, Response } from "express";
import logger from "../../../logger";
import { UserData, PasswordUpdate } from "../../types/model/User";
import { localize } from "../../utils/msgLocalize";
import { customeError } from "../../utils/errorUtils";

const UserReq = class UserReq extends UserController {
  static async handleCreatUser(req: Request, res: Response) {
    try {
      let userData: UserData = req.body;
      if (userData) {
        let user = await super.addUser(userData);
        if (user) {
          return res.send(user);
        } else {
          return res.status(400).send(customeError("missing_data", 400));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleCreatUserError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateUser(req: Request, res: Response) {
    try {
      let userData: UserData = req.body;
      if (userData) {
        let user = await super.updateUser(userData);
        if (user) {
          return res.send(user);
        } else {
          res.status(409).send(customeError("user_not_exist", 409));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleUpdateUser: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdatePassword(req: Request, res: Response) {
    try {
      let userData: PasswordUpdate = req.body;
      logger.info({ userData });
      if (userData) {
        let user = await super.updatePassword(userData);
        if (user) {
          return res.send(user);
        } else {
          res.status(409).send(customeError("user_not_exist", 409));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleUpdatePassword: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleDeleteUser(req: Request, res: Response) {
    try {
      let _id: string = req.body;
      if (_id) {
        let user = await super.deleteUserInfo(_id);
        if (user) {
          return res.status(200).send(successMsg("delete_success", 200));
        } else {
          res.status(400).send(customeError("user_not_exist", 400));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleUpdatePassword: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetUserPmOrSA(req: Request, res: Response) {
    try {
      let userData: GetUserData = req.query;
      if (userData) {
        let user = await super.getUsersPmOrSA(userData);
        if (user) {
          return res.status(200).send(user);
        } else {
          res.status(409).send(customeError("user_not_exist", 409));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleGetUserPmOrSAError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default UserReq;
