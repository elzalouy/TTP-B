import { model, Schema } from "mongoose";
import logger from "../../logger";
import { Movement, TaskData, TaskInfo, TasksModel } from "../types/model/tasks";
import Project from "./Project";
import { TaskDeadlineChain } from "../types/model/tasks";
export const FilesSchema: Schema = new Schema({
  name: { type: String },
  trelloId: { type: String },
  mimeType: { type: String },
  url: { type: String },
});
export const movementSchema: Schema = new Schema<Movement>({
  status: {
    type: String,
    enum: [
      "In Progress",
      "Done",
      "Review",
      "Shared",
      "Not Clear",
      "Cancled",
      "Tasks Board",
    ],
    default: "Tasks Board",
  },
  movedAt: { Type: Date },
});

export const deadlineChainSchema: Schema = new Schema<TaskDeadlineChain>({
  userId: { type: Schema.Types.ObjectId, required: true },
  name: { type: String, required: true },
  before: { type: Date, required: true },
  current: { type: Date, required: true },
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
      required: false,
      defualt: null,
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
      default: null,
      required: false,
    },
    boardId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "In Progress",
      enum: [
        "In Progress",
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
    attachedFiles: {
      type: [FilesSchema],
      default: [],
    },
    description: {
      type: String,
      default: null,
    },
    trelloShortUrl: {
      type: String,
      default: null,
    },
    deadlineChain: {
      type: [deadlineChainSchema],
      required: true,
      default: [],
      min: 0,
    },
    movements: { type: [movementSchema], min: 1, required: true },
  },
  {
    timestamps: true,
    strict: false,
  }
);

TaskSchema.static("getTasksAsCSV", async function (filterIds: string[]) {
  try {
    let tasks = await Tasks.find(
      {
        _id: { $in: filterIds },
      },
      {},
      { lean: true }
    );

    if (tasks && tasks.length > 0) {
      let porjectsIds = tasks.map((item) => item?.projectId?.toString());
      // i am taking the first id cause our filter is based on selecting a specific project's tasks or getting all tasks with the remained filter options.
      let projects = await Project.find({
        _id: { $in: porjectsIds },
      });
      let data: any = tasks?.map((item) => {
        let project = projects?.find(
          (project) => project._id.toString() === item?.projectId?.toString()
        );
        return {
          id: item?._id?.toString(),
          name: item.name,
          ProjectManagerName: project?.projectManagerName
            ? project.projectManagerName
            : "Un Assigned to any Project",
          projectName: project?.name
            ? project.name
            : "Un Assigned to any project",
          status: item.status,
          startDate: item.start,
          deadline: item.deadline,
        };
      });
      const convert = [Object.keys(data[0])].concat(data);
      const csvData = convert
        .map((item) => {
          return Object?.values(item)?.toString();
        })
        .join("\n");
      // const newTaskCsvFile=appendFileSync()
      return csvData;
    }
  } catch (error) {
    logger.error({ getTasksCsvError: error });
    return error;
  }
});

const Tasks = model<TaskInfo, TasksModel>("tasks", TaskSchema);
export const TaskFileSchema = model("attachedFiles", FilesSchema);
export default Tasks;
