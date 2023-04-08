"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFileSchema = exports.FilesSchema = void 0;
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("../../logger"));
const Project_1 = __importDefault(require("./Project"));
exports.FilesSchema = new mongoose_1.Schema({
    name: { type: String },
    trelloId: { type: String },
    mimeType: { type: String },
    url: { type: String },
});
const movementSchema = new mongoose_1.Schema({
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
const deadlineChainSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    before: { type: Date, required: true },
    current: { type: Date, required: true },
});
const TaskSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "projects",
        required: false,
        defualt: null,
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
    teamId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "teams",
        default: null,
    },
    listId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        type: [exports.FilesSchema],
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
}, {
    timestamps: true,
    strict: false,
});
TaskSchema.static("getTasksAsCSV", function (filterIds) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tasks = yield Tasks.find({
                _id: { $in: filterIds },
            }, {}, { lean: true });
            if (tasks && tasks.length > 0) {
                let porjectsIds = tasks.map((item) => { var _a; return (_a = item === null || item === void 0 ? void 0 : item.projectId) === null || _a === void 0 ? void 0 : _a.toString(); });
                // i am taking the first id cause our filter is based on selecting a specific project's tasks or getting all tasks with the remained filter options.
                let projects = yield Project_1.default.find({
                    _id: { $in: porjectsIds },
                });
                let data = tasks === null || tasks === void 0 ? void 0 : tasks.map((item) => {
                    var _a;
                    let project = projects === null || projects === void 0 ? void 0 : projects.find((project) => { var _a; return project._id.toString() === ((_a = item === null || item === void 0 ? void 0 : item.projectId) === null || _a === void 0 ? void 0 : _a.toString()); });
                    return {
                        id: (_a = item === null || item === void 0 ? void 0 : item._id) === null || _a === void 0 ? void 0 : _a.toString(),
                        name: item.name,
                        ProjectManagerName: (project === null || project === void 0 ? void 0 : project.projectManagerName)
                            ? project.projectManagerName
                            : "Un Assigned to any Project",
                        projectName: (project === null || project === void 0 ? void 0 : project.name)
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
                    var _a;
                    return (_a = Object === null || Object === void 0 ? void 0 : Object.values(item)) === null || _a === void 0 ? void 0 : _a.toString();
                })
                    .join("\n");
                // const newTaskCsvFile=appendFileSync()
                return csvData;
            }
        }
        catch (error) {
            logger_1.default.error({ getTasksCsvError: error });
            return error;
        }
    });
});
const Tasks = (0, mongoose_1.model)("tasks", TaskSchema);
exports.TaskFileSchema = (0, mongoose_1.model)("attachedFiles", exports.FilesSchema);
exports.default = Tasks;
