import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import logger from "../../logger";
import { removeOldNotifications } from "../backgroundJobs/actions/notifications.actions.cron";
import {
  projectsDueDate,
  projectsPassedDate,
} from "../backgroundJobs/actions/project.actions.cron";
import { initializeQueue } from "../backgroundJobs/actions/init.actions.queue";
import { initializeCardsPlugins, initializeTrelloBoards } from "./db/dbConnect";
import { taskRoutesQueue } from "../backgroundJobs/routes/tasks.Route.Queue";
import TaskController from "../controllers/task";

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
      await initializeTrelloBoards().then(async () => {
        await TaskController.matchTasksWithTrello().then(async () => {
          // await initializeCardsPlugins();
        });
      });
    });
  } catch (error) {
    logger.error({ errorOldNotificationsCron: error });
  }
}
