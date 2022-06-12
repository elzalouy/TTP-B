import queue from "queue";
import logger from "../../logger";
import BoardController from "../controllers/boards";
import TaskDB from "../dbCalls/tasks/tasks";

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
