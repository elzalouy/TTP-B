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
      ref: "categories",
      default: null,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      ref: "techMembers",
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
      enum: ["inProgress", "shared", "done","not started", "not clear", "cancled", "review"],
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
