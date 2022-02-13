import { successMsg } from './../../utils/successMsg';
import { customeError } from "./../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import { localize } from "../../utils/msgLocalize";
import TechMemberController from "../../controllers/techMember";

const TechMemberReq = class TechMemberReq extends TechMemberController {
  static async handleCreatMember(req: Request, res: Response) {
    try {
      let member = await super.createNewMember(req.body);
      if (member.status === 200 ) {
        return res.status(200).send(member);
      } else {
        return res.status(400).send(member);
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleUpdateTechMember(req: Request, res: Response) {
    try {
      let member = await super.updateTechMember(req.body);
      if (member) {
        return res.status(200).send(successMsg('tec_member_updated',200));
      } else {
        return res.status(400).send(customeError("tec_member_update_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetTecMember(req: Request, res: Response) {
    try {
      let members = await super.getTechMember(req.query);
      if (members) {
        return res.status(200).send(members);
      } else {
        return res.status(400).send(customeError("tec_member_get_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }
};

export default TechMemberReq;
