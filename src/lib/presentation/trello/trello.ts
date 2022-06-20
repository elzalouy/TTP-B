import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import { localize } from "../../utils/msgLocalize";
import BoardController from "../../controllers/trello";
import { webhookUpdateInterface } from "../../types/controller/Tasks";

const BoardReq = class BoardReq extends BoardController {
  static async handleGetBoards(req: Request, res: Response) {
    try {
      let boards = await super.getBoardsInTrello();
      if (boards) {
        return res.send(boards);
      } else {
        return res.status(400).send(customeError("boards_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleWebhookUpdateCard(req: Request, res: Response) {
    try {
      let trelloData: webhookUpdateInterface = req.body;
      let task: any = await super.webhookUpdate(trelloData);
      return res.status(200).send(task);
    } catch (error) {
      logger.error({ handleWebhookUpdateCardError: error });
    }
  }

  static async handleGetMembers(req: Request, res: Response) {
    try {
      let members = await super.getMembersInTrello();
      if (members) {
        return res.send(members);
      } else {
        return res.status(400).send(customeError("boards_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleGetBoardInfo(req: Request, res: Response) {
    try {
      const id = req.query.id as string;
      const type = req.query.type as string;
      let members = await super.getSingleBoardInfo(id, type);
      if (members) {
        return res.send(members);
      } else {
        return res.status(400).send(customeError("boards_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleAddMember(req: Request, res: Response) {
    try {
      const { boardId, memberId, type } = req.body;
      let member = await super.addMemberToBoard(boardId, memberId, type);
      if (member) {
        return res.send(member);
      } else {
        return res.status(400).send(customeError("boards_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleAddList(req: Request, res: Response) {
    try {
      const { boardId, listName } = req.body;
      let list = await super.addListToBoard(boardId, listName);
      if (list) {
        return res.send(list);
      } else {
        return res.status(400).send(customeError("boards_error", 400));
      }
    } catch (error) {
      logger.error({ handleGetBoards: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  // static async handleCreateAttachmentTest(req: Request, res: Response) {
  //   try {
  //     let cardId = req.body.cardId;
  //     if (req.files) {
  //       let files: any = req.files;
  //       let result = await super.__createAttachment(cardId, files[0]);
  //       console.log(result);
  //       return res.send(result);
  //     } else res.send("no files");
  //   } catch (error) {
  //     logger.error({ handleGetBoards: error });
  //     return res.status(500).send(customeError("server_error", 500));
  //   }
  // }
};

export default BoardReq;