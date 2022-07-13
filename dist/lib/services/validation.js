"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateExtentions = exports.editTaskSchema = exports.createTaskSchema = void 0;
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
    projectManagerName: joi_1.default.string().required().min(2).max(50).messages({
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
    name: joi_1.default.string().required().min(4).max(50).messages({
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
    subCategoryId: joi_1.default.string().optional().allow(null, "").messages({
        "string.base": "Sub Category is required",
        "string.empty": "Sub Category should be selected",
        "any.required": "Sub Category is required",
    }),
    listId: joi_1.default.string().optional().allow("").messages({
        "string.base": "Department is required",
        "string.empty": "Department should be string with min 4 chars",
        "string.min": "Department length should be Min 4 chars",
        "string.max": "Department length should be Max 20 chars",
        "any.required": "Department is required",
    }),
    teamId: joi_1.default.string().optional().allow(null).messages({
        "string.base": "Team is required",
        "string.empty": "Team should be selected",
        "string.min": "Team should be selected",
        "any.required": "Team is required",
    }),
    status: joi_1.default.string().valid("Tasks Board", "inProgress").required().messages({
        "string.base": "Status is required",
        "string.empty": "Status should be string with min 4 chars",
        "string.min": "Status length should be Min 4 chars",
        "string.max": "Status length should be Max 20 chars",
        "any.required": "Status is required",
    }),
    start: joi_1.default.date().required().messages({
        "any.required": "Task start date is required",
    }),
    deadline: joi_1.default.date().optional().allow(null, "").messages({
        "any.required": "Task Deadline is required",
    }),
    boardId: joi_1.default.string().required().min(4).messages({
        "string.base": "Department is required",
        "string.empty": "Department should be string with min 4 chars",
        "string.min": "Department length should be Min 4 chars",
        "string.max": "Department length should be Max 20 chars",
        "any.required": "Department is required",
    }),
    description: joi_1.default.string().optional().allow("", null).messages({
        "string.base": "Description is required",
        "string.empty": "Description should be string with min 10 chars",
        "any.required": "Description is required",
    }),
    deliveryDate: joi_1.default.any().allow(null),
    done: joi_1.default.any().allow(null),
    turnoverTime: joi_1.default.allow(null),
    attachedFiles: joi_1.default.array().optional().allow(null),
});
exports.editTaskSchema = joi_1.default.object({
    id: joi_1.default.string()
        .required()
        .messages({ "any.required": "Task id is required" }),
    name: joi_1.default.string().optional().min(4).max(50).messages({
        "string.base": "Task Name is required",
        "string.empty": "Task name should be string with min 4 chars",
        "string.min": "Task name length should be Min 4 chars",
        "string.max": "Task name length should be Max 50 chars",
    }),
    categoryId: joi_1.default.string().optional().messages({
        "string.base": "Category is required",
        "string.empty": "Category should be selected",
    }),
    cardId: joi_1.default.string()
        .required()
        .messages({ "any.required": "Card id is required" }),
    deleteFiles: joi_1.default.string().optional(),
    subCategoryId: joi_1.default.string().optional().allow(null, "").messages({
        "string.base": "Sub Category is required",
        "string.empty": "Sub Category should be selected",
    }),
    listId: joi_1.default.string().optional().allow("").messages({
        "string.base": "Department is required",
        "string.empty": "Department should be string with min 4 chars",
        "string.min": "Department length should be Min 4 chars",
        "string.max": "Department length should be Max 20 chars",
    }),
    teamId: joi_1.default.string().optional().allow(null).messages({
        "string.base": "Team is required",
        "string.empty": "Team should be selected",
        "string.min": "Team should be selected",
    }),
    status: joi_1.default.string()
        .valid("Tasks Board", "inProgress", "Review", "Cancled", "Done", "Late", "Shared", "Not Clear")
        .optional()
        .messages({
        "string.base": "Status is required",
        "string.empty": "Status should be string with min 4 chars",
        "string.min": "Status length should be Min 4 chars",
        "string.max": "Status length should be Max 20 chars",
    }),
    deadline: joi_1.default.date().optional().allow(null, "").messages({
        "any.required": "Task Deadline is required",
    }),
    boardId: joi_1.default.string().optional().min(4).messages({
        "string.base": "Department is required",
        "string.empty": "Department should be string with min 4 chars",
        "string.min": "Department length should be Min 4 chars",
        "string.max": "Department length should be Max 20 chars",
        "any.required": "Department is required",
    }),
    attachedFiles: joi_1.default.array().optional().allow(null),
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
    }
    console.log(format);
    return format;
};
exports.validateExtentions = validateExtentions;
