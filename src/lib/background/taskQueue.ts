import queue from "queue";
import logger from "../../logger";
import BoardController from "../controllers/boards";
import NotificationController from "../controllers/notification";
import ProjectDB from "../dbCalls/project/project";
import TaskDB from "../dbCalls/tasks/tasks";
import { io } from "../server";

export const TaskQueue = queue({ results: [] });
export function moveTaskJob(listId: string, cardId: string, status: string) {
  TaskQueue.push(async (cb) => {
    try {
      const result = await BoardController.moveTaskToDiffList(cardId, listId);
      cb(null, { message: "move in trello" });
    } catch (error) {
      logger.error({ moveTaskJobError: error });
    }
  });
  TaskQueue.push(async (cb) => {
    try {
      let task = await TaskDB.updateTaskStatus(
        {
          cardId: cardId,
        },
        {
          status: status,
          listId: listId,
        }
      );
      cb(null, task);
    } catch (error: any) {
      cb(new Error(error), null);
    }
  });
}
export const webhookUpdateMoveTaskJob = (data: any) => {
  TaskQueue.push(async (cb) => {
    try {
      const targetList: any = [
        "Tasks Board",
        "Done",
        "Shared",
        "Review",
        "Not Clear",
        "Cancled",
        "inProgress",
      ];
      let targetTask: any;
      if (
        targetList.includes(data?.action?.display?.entities?.listAfter?.text)
      ) {
        targetTask = await TaskDB.updateTaskStatus(
          {
            cardId: data.action.display.entities.card.id,
          },
          {
            status: data?.action?.display?.entities?.listAfter?.text,
          }
        );

        // if task status update to shared send notification
        if (data?.action?.display?.entities?.listAfter?.text === "Shared") {
          let projectData: any = await ProjectDB.getProjectDB({
            _id: targetTask.projectId,
          });
          let userName: string =
            data?.action?.display?.entities?.memberCreator?.username;
          let cardName: string = data?.action?.display?.entities?.card?.text;

          let createNotifi = await NotificationController.createNotification({
            title: `${cardName} status has been changed to Shared`,
            description: `${cardName} status has been changed to shared by ${userName}`,
            projectManagerID: projectData.projectManager,
            projectID: targetTask.projectId,
            adminUserID: projectData.adminId,
          });
          // send notification to all the admin
          io.to("admin room").emit("notification update", createNotifi);
          // send notification to specific project manager
          io.to(`user-${projectData.projectManager}`).emit(
            "notification update",
            createNotifi
          );
        }
      }
    } catch (error: any) {
      cb(new Error(error), null);
      logger.error({ webHookUpdateMoveTaskJobError: error });
    }
  });
};
