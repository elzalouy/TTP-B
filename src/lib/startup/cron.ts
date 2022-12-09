import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import logger from "../../logger";
import { removeOldNotifications } from "../backgroundJobs/actions/notifications.actions.cron";
import {
  projectsDueDate,
  projectsPassedDate,
} from "../backgroundJobs/actions/project.actions.cron";
import { initializeTrelloBoardsJob } from "../backgroundJobs/actions/trello.actions.cron";
export default async function (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  try {
    await removeOldNotifications(io).start();
    await projectsDueDate(io).start();
    await projectsPassedDate(io).start();
    await initializeTrelloBoardsJob().start();
  } catch (error) {
    logger.error({ errorOldNotificationsCron: error });
  }
}
