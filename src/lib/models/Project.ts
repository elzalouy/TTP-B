import { ProjectInfo } from "./../types/model/Project";
import { model, Schema, Model } from "mongoose";
type ProjectModelType = Model<ProjectInfo>;

const ProjectSchema: Schema<ProjectInfo, ProjectModelType> = new Schema<
  ProjectInfo,
  ProjectModelType
>(
  {
    name: {
      type: String,
      required: true,
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    projectManagerName: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    projectDeadline: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    completedDate: {
      type: Date,
      default: null,
    },
    projectStatus: {
      type: String,
      default: "Not Started",
      enum: [
        "Not Started",
        "In Progress",
        "late",
        "delivered on time",
        "delivered before deadline",
        "delivered after deadline",
      ],
    },
    clientId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "clients",
    },
    boardId: {
      type: String,
      default: null,
    },
    listId: { type: String, default: null },
    cardId: { type: String, default: null },
    associateProjectManager: {
      type: String,
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);
const Project: Model<ProjectInfo> = model("projects", ProjectSchema);
export default Project;
