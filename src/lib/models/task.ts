import { model, Schema, Model } from "mongoose";
import { TaskInfo } from "../types/model/tasks";

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
      ref: "categorys",
      required: true,
    },
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "teams",
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
      enum: ["inProgress", "shared", "delivered","late", "not clear", "cancled"],
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
      // number of day the task late after deadline
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
