import { Express } from "express";
import Joi from "joi";
import _ from "lodash";
const createProjectSchema = Joi.object({
  name: Joi.string().required().min(4).messages({
    "string.base": "Project Name is required",
    "string.empty": "Project name should be string with min 4 chars",
    "string.min": "Project name length should be Min 4 chars",
    "string.max": "Project name length should be Max 20 chars",
    "any.required": "Project Name is required",
  }),
  projectManager: Joi.string().required().min(5).messages({
    "string.base": "Project Manager id is required",
    "string.empty": "Project Manager id should be string",
    "string.min": "Project Manager id length should be Min 4 chars",
    "any.required": "Project Manager is required",
  }),
  projectManagerName: Joi.string().required().min(2).max(50).messages({
    "string.base": "Project Manager Name  should be string",
    "string.empty": "Project Manager Name  is required",
    "string.min": "Project Manager Name length should be Min 2 chars",
    "string.required": "Project Manager is required",
  }),
  projectDeadline: Joi.date().optional().allow(null, "").messages({
    "any.required": "Project Deadline is required",
  }),
  startDate: Joi.date().required().messages({
    "any.required": "Project Start Date is required",
  }),
  clientId: Joi.string().required().min(2).max(50).messages({
    "any.required": "Client  is required",
    "string.base": "Client   should be string",
    "string.empty": "Client   is required",
    "string.min": "Client  length should be Min 2 chars",
  }),
  numberOfFinishedTasks: Joi.number().optional().allow(null, 0),
  numberOfTasks: Joi.number().optional().allow(null, 0),
  projectStatus: Joi.string().optional().allow("", null),
  completedDate: Joi.date().optional().allow(null),
  adminId: Joi.string().required().messages({
    "any.required": "Admin id is required for creating a project",
  }),
});

export const createTaskSchema = Joi.object({
  projectId: Joi.string().required().min(4).messages({
    "string.base": "Project Id is required",
    "string.empty": "Project Id is required",
    "string.min": "Project Id is required",
    "any.required": "Project Id is required",
  }),
  name: Joi.string().required().min(4).max(50).messages({
    "string.base": "Task Name is required",
    "string.empty": "Task name should be string with min 4 chars",
    "string.min": "Task name length should be Min 4 chars",
    "string.max": "Task name length should be Max 50 chars",
    "any.required": "Task Name is required",
  }),
  categoryId: Joi.string().required().messages({
    "string.base": "Category is required",
    "string.empty": "Category should be selected",
    "any.required": "Category is required",
  }),
  subCategoryId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Sub Category is required",
    "string.empty": "Sub Category should be selected",
    "any.required": "Sub Category is required",
  }),
  listId: Joi.string().optional().allow("").messages({
    "string.base": "Department is required",
    "string.empty": "Department should be string with min 4 chars",
    "string.min": "Department length should be Min 4 chars",
    "string.max": "Department length should be Max 20 chars",
    "any.required": "Department is required",
  }),
  teamId: Joi.string().optional().allow(null).messages({
    "string.base": "Team is required",
    "string.empty": "Team should be selected",
    "string.min": "Team should be selected",
    "any.required": "Team is required",
  }),
  status: Joi.string().valid("Tasks Board", "inProgress").required().messages({
    "string.base": "Status is required",
    "string.empty": "Status should be string with min 4 chars",
    "string.min": "Status length should be Min 4 chars",
    "string.max": "Status length should be Max 20 chars",
    "any.required": "Status is required",
  }),
  start: Joi.date().required().messages({
    "any.required": "Task start date is required",
  }),
  deadline: Joi.date().optional().allow(null, "").messages({
    "any.required": "Task Deadline is required",
  }),
  boardId: Joi.string().required().min(4).messages({
    "string.base": "Department is required",
    "string.empty": "Department should be string with min 4 chars",
    "string.min": "Department length should be Min 4 chars",
    "string.max": "Department length should be Max 20 chars",
    "any.required": "Department is required",
  }),
  description: Joi.string().optional().allow("", null).messages({
    "string.base": "Description is required",
    "string.empty": "Description should be string with min 10 chars",
    "any.required": "Description is required",
  }),
  deliveryDate: Joi.any().allow(null),
  done: Joi.any().allow(null),
  turnoverTime: Joi.allow(null),
  attachedFiles: Joi.array().optional().allow(null),
});

export const editTaskSchema = Joi.object({
  id: Joi.string()
    .required()
    .messages({ "any.required": "Task id is required" }),
  name: Joi.string().optional().min(4).max(50).messages({
    "string.base": "Task Name is required",
    "string.empty": "Task name should be string with min 4 chars",
    "string.min": "Task name length should be Min 4 chars",
    "string.max": "Task name length should be Max 50 chars",
  }),
  categoryId: Joi.string().optional().messages({
    "string.base": "Category is required",
    "string.empty": "Category should be selected",
  }),
  cardId: Joi.string()
    .required()
    .messages({ "any.required": "Card id is required" }),
  deleteFiles: Joi.string().optional(),
  subCategoryId: Joi.string().optional().allow(null, "").messages({
    "string.base": "Sub Category is required",
    "string.empty": "Sub Category should be selected",
  }),
  listId: Joi.string().optional().allow("").messages({
    "string.base": "Department is required",
    "string.empty": "Department should be string with min 4 chars",
    "string.min": "Department length should be Min 4 chars",
    "string.max": "Department length should be Max 20 chars",
  }),
  teamId: Joi.string().optional().allow(null).messages({
    "string.base": "Team is required",
    "string.empty": "Team should be selected",
    "string.min": "Team should be selected",
  }),
  status: Joi.string()
    .valid(
      "Tasks Board",
      "inProgress",
      "Review",
      "Cancled",
      "Done",
      "Late",
      "Shared",
      "Not Clear"
    )
    .optional()
    .messages({
      "string.base": "Status is required",
      "string.empty": "Status should be string with min 4 chars",
      "string.min": "Status length should be Min 4 chars",
      "string.max": "Status length should be Max 20 chars",
    }),
  deadline: Joi.date().optional().allow(null, "").messages({
    "any.required": "Task Deadline is required",
  }),
  boardId: Joi.string().optional().min(4).messages({
    "string.base": "Department is required",
    "string.empty": "Department should be string with min 4 chars",
    "string.min": "Department length should be Min 4 chars",
    "string.max": "Department length should be Max 20 chars",
    "any.required": "Department is required",
  }),
  attachedFiles: Joi.array().optional().allow(null),
  description: Joi.string().optional().allow(""),
});

export const validateExtentions = (name: string) => {
  let ext = _.split(name, ".");
  let extention = ext[ext.length - 1];
  let types = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/svg",
    "text/csv",
    "application/msword", // .doc
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
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
  }
  console.log(format);
  return format;
};
