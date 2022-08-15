import { model, Schema, Model } from "mongoose";
import logger from "../../logger";
import { TaskInfo, TasksModel } from "../types/model/tasks";
const FilesSchema: Schema = new Schema({
  name: { type: String },
  trelloId: { type: String },
  mimeType: { type: String },
  url: { type: String },
});

const TaskSchema = new Schema<TaskInfo, TasksModel>(
  {
    name: {
      type: String,
      required: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "categories",
      default: null,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "teams",
      default: null,
    },
    listId: {
      type: Schema.Types.ObjectId,
      required: true,
      default: null,
    },
    cardId: {
      type: String,
      required: true,
      unique: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "inProgress",
      enum: [
        "inProgress",
        "Shared",
        "Done",
        "Tasks Board",
        "Not Clear",
        "Cancled",
        "Review",
        "Archived",
      ],
    },
    start: {
      type: Date,
      default: Date.now(),
    },
    deadline: {
      type: Date,
      default: null,
    },
    deliveryDate: {
      type: Date,
      default: null,
    },
    attachedFiles: {
      type: [FilesSchema],
      default: [],
    },
    attachedCard: {
      type: String,
      default: null,
    },
    lastMove: {
      type: String,
      default: null,
    },
    lastMoveDate: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      default: null,
    },
    history: {
      type: [
        {
          listId: { type: String, required: true },
          boardId: { type: String, required: true, unique: true },
          date: { type: String, required: true },
        },
      ],
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);
TaskSchema.static(
  "updateHistory",
  async function (cardId: string, cb?: (doc: TaskInfo) => any) {
    try {
      let task = await Tasks.findOne({ cardId: cardId });
      if (task) {
        let index = task.history.findIndex((i) => i.boardId === task.boardId);
        if (index >= 0) {
          task.history[index].listId = task.listId;
          task.history[index].date = new Date().toString();
        } else
          task.history.push({
            boardId: task.boardId,
            listId: task.listId,
            date: new Date().toString(),
          });
        return await task.save();
      }
    } catch (error) {
      logger.error({ updateTeamsError: error });
      return error;
    }
  }
);
const Tasks = model<TaskInfo, TasksModel>("tasks", TaskSchema);
export default Tasks;
