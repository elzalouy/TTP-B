import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import logger from "../../logger";
import { removeOldNotifications } from "../backgroundJobs/actions/notifications.actions.cron";
import {
  projectsDueDate,
  projectsPassedDate,
} from "../backgroundJobs/actions/project.actions.cron";
import { initializeQueue } from "../backgroundJobs/actions/init.actions.queue";
import {
  initializeCardsPlugins,
  initializeTTPTasks,
  initializeTrelloBoards,
} from "./db/dbConnect";
import { taskRoutesQueue } from "../backgroundJobs/routes/tasks.Route.Queue";
import { initializeSystemTasksPluginsJob } from "../backgroundJobs/actions/trello.actions.cron";

export default async function (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  try {
    initializeQueue.push(() => {
      removeOldNotifications(io).start();
    });
    initializeQueue.push(() => {
      projectsDueDate(io).start();
    });
    initializeQueue.push(() => {
      projectsPassedDate(io).start();
    });
    initializeQueue.push(async (cb) => {
      await initializeTrelloBoards().then(() => {
        // initializeTTPTasks().then(async () => {
        //   // initializeSystemTasksPluginsJob().start();
        // });
      });
    });
  } catch (error) {
    logger.error({ errorOldNotificationsCron: error });
  }
}
