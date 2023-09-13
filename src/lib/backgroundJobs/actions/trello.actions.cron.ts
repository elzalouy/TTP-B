import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CronJob } from "cron";
import logger from "../../../logger";
import {
  initializeTTPTasks,
  initializeTrelloBoards,
  initializeTrelloMembers,
} from "../../startup/db/dbConnect";
import TrelloController from "../../controllers/trello";
export function initializeTrelloBoardsJob() {
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
export function initializeTrelloMembersJob() {
  return new CronJob(
    "0 6 * * *",
    async () => {
      await initializeTrelloMembers();
    },
    null,
    true,
    "Asia/Riyadh",
    null,
    true
  );
}

export function initializeSystemTasksJob() {
  return new CronJob(
    "0 6 * * *",
    async () => {
      await initializeTTPTasks();
    },
    null,
    true,
    "Asia/Riyadh",
    null,
    true
  );
}
