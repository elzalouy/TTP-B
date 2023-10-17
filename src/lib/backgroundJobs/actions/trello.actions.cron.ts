import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { CronJob } from "cron";
import logger from "../../../logger";
import {
  initializeCardsPlugins,
  initializeTTPTasks,
  initializeTrelloBoards,
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

export function initializeSystemTasksPluginsJob() {
  return new CronJob(
    "0 6 * * *",
    async () => {
      await initializeCardsPlugins();
    },
    null,
    true,
    "Asia/Riyadh",
    null,
    true
  );
}
