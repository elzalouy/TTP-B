import moment from "moment";
import cron from "node-cron";
import logger from "../../logger";
import NotificationController from "../controllers/notification";
import ProjectDB from "../dbCalls/project/project";
import { io } from "../../index";
import TaskDB from "../dbCalls/tasks/tasks";

// '0 0 0 1-31 0-7'
//todo update notification cron job
export default function executeHob() {
  cron.schedule("* * 23 * * *", async () => {
    //todo check if project is passed the deadline
    let projects = await ProjectDB.getProjectDB({
      projectStatus: { $in: ["inProgress", "late"] },
      projectDeadline: { $lt: new Date() },
    });
    if (projects.length > 1) {
      for (let i = 0; i < projects.length; i++) {
        let createNotifi = await NotificationController.createNotification({
          title: `${projects[i].name} Overdue`,
          projectManagerID: projects[i].projectManager,
          description: `${projects[i].name} project Due date ${moment(
            projects[i].projectDeadline
          ).format("dd/mm/yyyy")}`,
          clientName: projects[i].clientId,
        });

        // send notification to all admin
        io.to("admin room").emit("notification update", createNotifi);

        // send notification to specific project manager
        io.to(`user-${projects[i].projectManager}`).emit(
          "notification update",
          createNotifi
        );
      }
    }

    //todo check if the task pass the deadline
    let tasks: any = await TaskDB.getAllTasksDB({
      status: { $in: ["inProgress"] },
      deadline: { $lt: new Date() },
    });

    if (tasks.length > 1) {
      for (let i = 0; i < tasks.length; i++) {
        let createNotifi = await NotificationController.createNotification({
          title: `${tasks[i].name} Overdue`,
          projectManagerID: tasks[i].projectManager,
          description: `${tasks[i].name} project Due date ${moment(
            tasks[i].projectDeadline
          ).format("dd/mm/yyyy")}`,
          clientName: tasks[i].clientId,
        });

        // send notification to all admin
        io.to("admin room").emit("notification update", createNotifi);

        // send notification to specific project manager
        io.to(`user-${projects[i].projectManager}`).emit(
          "notification update",
          createNotifi
        );
      }
    }
  });
}
