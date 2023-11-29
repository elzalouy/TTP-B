import { CronJob } from "cron";
import { initializeCardsPlugins } from "../../startup/db/dbConnect";
import logger from "../../../logger";

export function matchTasksWithTrelloJob() {
  return new CronJob(
    "",
    async () => {
      let result = await initializeCardsPlugins();
      logger.info({ initializeCardsPluginsResult: result });
    },
    () => console.log({ initializationOfPlugins: "done" }),
    true,
    "Asia/Riyadh",
    null,
    true
  );
}
