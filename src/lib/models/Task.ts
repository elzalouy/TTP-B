import { model, Schema, Model } from "mongoose";
import logger from "../../logger";
import { TaskInfo, TasksModel } from "../types/model/tasks";
export const FilesSchema: Schema = new Schema({
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
    trelloShortUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Tasks = model<TaskInfo, TasksModel>("tasks", TaskSchema);
export const TaskFileSchema = model("attachedFiles", FilesSchema);
export default Tasks;
