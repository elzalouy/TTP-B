import { GetUserData } from "./../../types/controller/user";
import { successMsg } from "./../../utils/successMsg";
import UserController from "../../controllers/user";
import { Request, Response } from "express";
import logger from "../../../logger";
import { UserData, PasswordUpdate } from "../../types/model/User";
import { customeError } from "../../utils/errorUtils";

const UserReq = class UserReq extends UserController {
  static async handleResendMail(req: any, res: Response) {
    try {
      let { id } = req.body;
      await super.resendNewUserMail(id);
      return res.status(200).send();
    } catch (error) {
      logger.error({ handleGetUserInfoError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetUserInfo(req: any, res: Response) {
    try {
      let id: string = req.query.id;
      let userData = await super.getUserById(id);
      return res.status(200).send(userData);
    } catch (error) {
      logger.error({ handleGetUserInfoError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
  static async handleCreateOM(req: Request, res: Response) {
    try {
      let userData: UserData = req.body;
      if (userData) {
        userData.role = "OM";
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
  static async handleCreatePM(req: Request, res: Response) {
    try {
      let userData: UserData = req.body;
      if (userData) {
        userData.role = "PM";
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
  static async handleCreateSM(req: Request, res: Response) {
    try {
      let userData: UserData = req.body;
      if (userData) {
        userData.role = "SM";
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

  static async handleResetPassword(req: Request, res: Response) {
    try {
      let userData: PasswordUpdate = req.body;
      logger.info({ userData });
      if (userData) {
        let user = await super.resetPassword(userData);
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
      let _id = req.query._id;
      if (_id && typeof _id === "string") {
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

  static async handleGetUsers(req: Request, res: Response) {
    try {
      let userData: GetUserData = req.query;
      if (userData) {
        let user = await super.getUsers(userData);
        if (user) {
          return res.status(200).send(user);
        } else {
          res.status(409).send(customeError("user_not_exist", 409));
        }
      } else {
        return res.status(400).send(customeError("missing_data", 400));
      }
    } catch (error) {
      logger.error({ handleGetUsersError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default UserReq;
