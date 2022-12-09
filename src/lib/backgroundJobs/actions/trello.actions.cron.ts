import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CronJob } from "cron";
import logger from "../../../logger";
import { initializeTrelloBoards } from "../../startup/db/dbConnect";
export function initializeTrelloBoardsJob(
  io?: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return new CronJob(
    "0 6 * * *",
    async () => {
      initializeTrelloBoards();
    },
    null,
    true,
    "Asia/Riyadh",
    null,
    true
  );
}
