import { customeError } from "../../utils/errorUtils";
import { Request, Response } from "express";
import logger from "../../../logger";
import TrelloWebhook from "../../controllers/trelloHooks";

const processedEvents = new Set();
export default class TrelloHooks {
  static async handleWebHookUpdateProject(req: Request, res: Response) {
    try {
      let payload = req.body;
      let eventId = payload?.action?.id;
      if (!processedEvents.has(eventId)) {
        processedEvents.add(eventId);
        let hook = new TrelloWebhook(req.body, "project");
        await hook.start();
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            processedEvents.delete(eventId);
          }, 50000);
        });
        res.send("Done");
      } else res.send("Implemented before");
    } catch (error) {
      logger.error({ handleWebHookUpdateProjectError: error });
      return res.status(500).send(customeError("server_error", 500));
    }
  }

  static async handleWebhookUpdateCard(req: Request, res: Response) {
    try {
      let payload = req.body;
      let eventId = payload?.action?.id;
      console.log({ eventId });
      if (!processedEvents.has(eventId)) {
        processedEvents.add(eventId);
        let hook = new TrelloWebhook(req.body, "task");
        await hook.start();
        const timeoutPromise = new Promise((resolve) => {
          setTimeout(() => {
            processedEvents.delete(eventId);
          }, 50000);
        });
        res.send("Done");
      } else res.send("Implemented before");
    } catch (error) {
      logger.error({ handleWebhookUpdateCardError: error });
    }
  }
}
