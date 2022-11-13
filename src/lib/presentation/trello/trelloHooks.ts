import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import { updateTaskQueue } from "../../backgroundJobs/actions/task.actions.Queue";
import TrelloWebhook from "../../controllers/trelloHooks";

export default class TrelloHooks {
  static async handleWebHookUpdateProject(req: Request, res: Response) {
    try {
      let hook = new TrelloWebhook(req.body, "project");
      await hook.start();
      return res.send("Done");
    } catch (error) {
      logger.error({ handleCreateCardInBoardError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleWebhookUpdateCard(req: Request, res: Response) {
    try {
      updateTaskQueue.push(async (cb) => {
        let hook = new TrelloWebhook(req.body, "task");
        let data = await hook.start();
        return res.send("Done");
      });
    } catch (error) {
      logger.error({ handleWebhookUpdateCardError: error });
    }
  }
}
