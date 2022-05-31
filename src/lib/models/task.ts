import { model, Schema, Model } from "mongoose";
import { TaskInfo } from "../types/model/tasks";
import Joi from "joi";
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
    },
    cardId: {
      type: String,
      required: true,
    },
    boardId: {
      type: String,
      required: true,
    },
    countNotClear: {
      //back from not clear
      type: Number,
      default: 0,
    },
    countShared: {
      //back from shared
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      default: "inProgress",
      enum: [
        "inProgress",
        "Shared",
        "Done",
        "Not Started",
        "Not Clear",
        "Cancled",
        "Review",
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
    done: {
      type: Date,
      default: null,
    },
    turnoverTime: {
      type: Number,
      default: 0,
    },
    attachedFiles: {
      type: String,
      default: null,
    },
    attachedCard: {
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
