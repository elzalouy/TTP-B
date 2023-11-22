import { Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import ProjectDB from "../../dbCalls/project/project";
import NotificationDB from "../../dbCalls/notification/notification";
import { ProjectInfo } from "../../types/model/Project";
import { socketPMs } from "../../startup/socket";
import { userSocket } from "../../types/controller/user";
import { CronJob } from "cron";
import Project from "../../models/Project";
import ProjectController from "../../controllers/project";

/**
 * projectsDueDate
 * It's a cron job initialized and called for geting the projects closed to their due dates.
 * @param io IO socket
 */
export function projectsDueDate(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return new CronJob(
    "0 9-18/3 * * *",
    async () => {
      let today = new Date();
      let dueDateProjects = await Project.find()
        .where("projectStatus")
        .equals(["In Progress", "late"])
        .where("projectDeadline")
        .lt(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).getTime())
        .where("startDate")
        .lt(new Date().getTime());
      if (dueDateProjects && dueDateProjects.length > 0) {
        dueDateProjects.forEach(async (item: ProjectInfo) => {
          await NotificationDB.__createNotification({
            title: `${item.name} due date confirmation`,
            description: `${item.name} has a soon due date, please be aware`,
            isNotified: [{ userId: item.projectManager, isNotified: false }],
          });
        });
        let ids = dueDateProjects.map((item: ProjectInfo) =>
          item.projectManager.toString()
        );
        let sockets = socketPMs.filter((item: userSocket) =>
          ids.includes(item.id)
        );
        let ioIds = sockets.map((item) => item.socketId);
        io.to(ioIds).emit("notification-update");
      }
    },
    null,
    true,
    "Asia/Riyadh"
  );
}

/**
 * projectsPassDate
 * it's a cron job for notifying the users with the passed due dates of the current project.
 */
export function projectsPassedDate(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  return new CronJob(
    "0 9-18/3 * * *",
    async () => {
      let passedDatesPojects = await Project.find({
        projectStatus: { $in: ["In Progress", "late"] },
      })
        .where("projectStatus")
        .equals(["In Progress", "late"])
        .where("projectDeadline")
        .lte(new Date().getTime());
      console.log(new Date(), "2022-10-24T22:00:00.000+00:00");
      console.log({ passedDatesPojects });
      if (passedDatesPojects.length > 0) {
        passedDatesPojects.forEach(async (item: ProjectInfo) => {
          await NotificationDB.__createNotification({
            title: `${item.name} passed due date`,
            description: `${item.name} has passed the due date, be aware`,
            isNotified: [{ userId: item.projectManager, isNotified: false }],
          });
          let ids = passedDatesPojects.map((item: ProjectInfo) =>
            item.projectManager.toString()
          );
          let sockets = socketPMs.filter((item: userSocket) =>
            ids.includes(item.id)
          );
          console.log({ sockets, socketPMs });
          let ioIds = sockets.map((item) => item.socketId);
          io.to(ioIds).emit("notification-update");
        });
      }
    },
    null,
    true,
    "Asia/Riyadh"
  );
}

export function syncProjectsWithTasksJob() {
  return new CronJob(
    "0 6 * * *",
    async () => {
      console.log("start sync projects with tasks");
      await ProjectController.__syncProjectsWithTasks();
    },
    null,
    true,
    "Asia/Riyadh"
  );
}
