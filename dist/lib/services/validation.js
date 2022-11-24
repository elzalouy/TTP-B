"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExtentions =
  exports.editTaskSchema =
  exports.createTaskSchema =
    void 0;
const joi_1 = __importDefault(require("joi"));
const lodash_1 = __importDefault(require("lodash"));
const createProjectSchema = joi_1.default.object({
  name: joi_1.default.string().required().min(4).messages({
    "string.base": "Project Name is required",
    "string.empty": "Project name should be string with min 4 chars",
    "string.min": "Project name length should be Min 4 chars",
    "string.max": "Project name length should be Max 20 chars",
    "any.required": "Project Name is required",
  }),
  projectManager: joi_1.default.string().required().min(5).messages({
    "string.base": "Project Manager id is required",
    "string.empty": "Project Manager id should be string",
    "string.min": "Project Manager id length should be Min 4 chars",
    "any.required": "Project Manager is required",
  }),
  projectManagerName: joi_1.default
    .string()
    .required()
    .min(2)
    .max(50)
    .messages({
      "string.base": "Project Manager Name  should be string",
      "string.empty": "Project Manager Name  is required",
      "string.min": "Project Manager Name length should be Min 2 chars",
      "string.required": "Project Manager is required",
    }),
  projectDeadline: joi_1.default.date().optional().allow(null, "").messages({
    "any.required": "Project Deadline is required",
  }),
  startDate: joi_1.default.date().required().messages({
    "any.required": "Project Start Date is required",
  }),
  clientId: joi_1.default.string().required().min(2).max(50).messages({
    "any.required": "Client  is required",
    "string.base": "Client   should be string",
    "string.empty": "Client   is required",
    "string.min": "Client  length should be Min 2 chars",
  }),
  numberOfFinishedTasks: joi_1.default.number().optional().allow(null, 0),
  numberOfTasks: joi_1.default.number().optional().allow(null, 0),
  projectStatus: joi_1.default.string().optional().allow("", null),
  completedDate: joi_1.default.date().optional().allow(null),
  adminId: joi_1.default.string().required().messages({
    "any.required": "Admin id is required for creating a project",
  }),
});
exports.createTaskSchema = joi_1.default.object({
  projectId: joi_1.default.string().required().min(4).messages({
    "string.base": "Project Id is required",
    "string.empty": "Project Id is required",
    "string.min": "Project Id is required",
    "any.required": "Project Id is required",
  }),
  name: joi_1.default.string().required().min(4).messages({
    "string.base": "Task Name is required",
    "string.empty": "Task name should be string with min 4 chars",
    "string.min": "Task name length should be Min 4 chars",
    "string.max": "Task name length should be Max 50 chars",
    "any.required": "Task Name is required",
  }),
  categoryId: joi_1.default.string().required().messages({
    "string.base": "Category is required",
    "string.empty": "Category should be selected",
    "any.required": "Category is required",
  }),
  listId: joi_1.default.string().required().messages({
    "string.base": "You should select a department to get its default list",
    "string.empty": "You should select a department to get its default list",
    "any.required": "You should select a department to get its default list",
  }),
  boardId: joi_1.default.string().required().min(4).messages({
    "string.base": "You should select a department",
    "string.empty": "You should select a department",
    "string.min": "You should select a department",
    "string.max": "You should select a department",
    "any.required": "You should select a department",
  }),
  status: joi_1.default
    .string()
    .valid("Tasks Board", "In Progress")
    .required()
    .messages({
      "string.base": "Status is required",
      "string.empty": "Status should be string with min 4 chars",
      "string.min": "Status length should be Min 4 chars",
      "string.max": "Status length should be Max 20 chars",
      "any.required": "Status is required",
    }),
  start: joi_1.default.date().required().messages({
    "any.required": "Task start date is required",
  }),
  subCategoryId: joi_1.default.string().optional().allow(null),
  teamId: joi_1.default.string().optional().allow(null),
  deadline: joi_1.default.date().optional().allow(null),
  description: joi_1.default.string().optional().allow("", null),
  deliveryDate: joi_1.default.any().allow(null),
  done: joi_1.default.any().allow(null),
  turnoverTime: joi_1.default.allow(null),
  attachedFiles: joi_1.default.array().optional().allow(null),
});
exports.editTaskSchema = joi_1.default.object({
  id: joi_1.default
    .string()
    .required()
    .messages({ "any.required": "Task id is required" }),
  name: joi_1.default.string().optional().min(4).messages({
    "string.base": "Task Name is required",
    "string.empty": "Task name should be string with min 4 chars",
    "string.min": "Task name length should be Min 4 chars",
    "string.max": "Task name length should be Max 50 chars",
  }),
  categoryId: joi_1.default.string().required().messages({
    "string.base": "You should select a category",
    "string.empty": "You should select a category",
  }),
  cardId: joi_1.default
    .string()
    .required()
    .messages({ "any.required": "Card id is required" }),
  subCategoryId: joi_1.default.string().optional().allow(null, ""),
  listId: joi_1.default.string().optional().allow(""),
  teamId: joi_1.default.string().optional().allow(null),
  status: joi_1.default
    .string()
    .valid(
      "Tasks Board",
      "In Progress",
      "Review",
      "Cancled",
      "Done",
      "Late",
      "Shared",
      "Not Clear"
    )
    .optional(),
  deadline: joi_1.default.date().optional().allow(null, ""),
  boardId: joi_1.default.string().required().messages({
    "string.base": "You should select a department",
    "any.required": "You should select a department",
  }),
  attachedFiles: joi_1.default.array().optional().allow(null),
  deleteFiles: joi_1.default.array().optional().allow(null),
  description: joi_1.default.string().optional().allow(""),
});
const validateExtentions = (name) => {
  let ext = lodash_1.default.split(name, ".");
  let extention = ext[ext.length - 1];
  let types = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg",
    "text/csv",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/gif",
    "application/pdf",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4",
    "video/3gpp",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/x-msvideo",
    "video/mpeg",
    "video/dvd",
    "video/xvid",
    "video/x-flv",
    "video/x-f4v",
    "video/divx",
    "video/mov",
    "application/pkcs8",
  ];
  let format = "";
  switch (extention) {
    case "png":
      format = types[0];
      break;
    case "jpeg":
      format = types[1];
      break;
    case "jpg":
      format = types[2];
      break;
    case "svg":
      format = types[3];
      break;
    case "csv":
      format = types[4];
      break;
    case "doc":
      format = types[5];
      break;
    case "docx":
      format = types[6];
      break;
    case "gif":
      format = types[7];
      break;
    case "pdf":
      format = types[8];
      break;
    case "ppt":
      format = types[9];
      break;
    case "pptx":
      format = types[10];
      break;
    case "mp4":
      format = types[11];
      break;
    case "3gpp":
      format = types[12];
      break;
    case "quicktime":
      format = types[13];
      break;
    case "x-ms-wmv":
      format = types[14];
      break;
    case "x-msvideo":
      format = types[15];
      break;
    case "mpeg":
      format = types[16];
      break;
    case "dvd":
      format = types[17];
      break;
    case "xvid":
      format = types[18];
      break;
    case "x-flv":
      format = types[19];
      break;
    case "x-f4v":
      format = types[20];
      break;
    case "divx":
      format = types[21];
      break;
    case "mov":
      format = types[22];
      break;
    case "key":
      format = types[23];
      break;
  }
  return format;
};
exports.validateExtentions = validateExtentions;
