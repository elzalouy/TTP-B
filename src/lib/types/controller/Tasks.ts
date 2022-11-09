import { TaskInfo } from "../model/tasks";
/**
 * task response to be returned from any layer to the presentation layer
 */
export interface taskResponse {
  task: TaskInfo | null;
  error: {
    path: string;
    message: string;
  } | null;
}
export let deleteFilesError: taskResponse = {
  error: {
    path: "deleteFiles",
    message: "delete files should have a valid file data.",
  },
  task: null,
};
export let provideCardIdError: taskResponse = {
  error: {
    path: "cardId",
    message:
      "Card id should be provided while uploading files or deleting files.",
  },
  task: null,
};
export let taskNotFoundError: taskResponse = {
  error: {
    path: "task",
    message: "Task not found",
  },
  task: null,
};
