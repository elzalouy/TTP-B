import { model, Schema, Model } from "mongoose";
import { TaskInfo } from "../types/model/tasks";
const FilesSchema: Schema = new Schema({
  name: { type: String, required: true },
  trelloId: { type: String, required: true },
  mimeType: { type: String, required: true },
  url: { type: String, required: true },
});
const TaskSchema: Schema = new Schema<TaskInfo>(
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
      default: null,
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
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Tasks: Model<TaskInfo> = model("tasks", TaskSchema);
export default Tasks;
