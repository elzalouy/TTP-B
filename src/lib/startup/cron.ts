import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import logger from "../../logger";
import { removeOldNotifications } from "../backgroundJobs/actions/notifications.actions.cron";
import {
  projectsDueDate,
  projectsPassedDate,
  syncProjectsWithTasksJob,
} from "../backgroundJobs/actions/project.actions.cron";
import {
  initializeQueue,
  intializeTaskQueue,
} from "../backgroundJobs/actions/init.actions.queue";
import { initializeCardsPlugins, initializeTrelloBoards } from "./db/dbConnect";
import TaskController from "../controllers/task";
import ProjectController from "../controllers/project";
import { matchTasksPluginsWithTrelloJob } from "../backgroundJobs/actions/tasks.actions.cron";

export default async function (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  try {
    initializeQueue.push(async (cb) => {
      console.log("0: start inializing boards");
      await initializeTrelloBoards();
    });

    initializeQueue.push(async (cb) => {
      console.log("1: start inializing tasks");
      await TaskController.matchTasksWithTrello();
    });

    initializeQueue.push(async (cb) => {
      console.log("2: start syncing projects with tasks");
      await ProjectController.__syncProjectsWithTasks();
      cb(null, true);
    });
    initializeQueue.push(async (cb) => {
      console.log("3: initializing cards plugins");
      matchTasksPluginsWithTrelloJob().start();
    });
    initializeQueue.push(() => {
      console.log("4: remove old notifications");
      removeOldNotifications(io).start();
    });

    initializeQueue.push(() => {
      console.log("5: projects due date checking and notifying");
      projectsDueDate(io).start();
    });

    initializeQueue.push(() => {
      console.log("6: projects passed date notifying");
      projectsPassedDate(io).start();
    });
  } catch (error) {
    logger.error({ errorOldNotificationsCron: error });
  }
}
