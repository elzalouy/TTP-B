"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskFileSchema = exports.FilesSchema = void 0;
const mongoose_1 = require("mongoose");
exports.FilesSchema = new mongoose_1.Schema({
    name: { type: String },
    trelloId: { type: String },
    mimeType: { type: String },
    url: { type: String },
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
        type: [exports.FilesSchema],
        default: [],
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
    description: {
        type: String,
        default: null,
    },
    trelloShortUrl: {
        type: String,
        default: null,
    },
}, {
    timestamps: true,
    strict: false,
});
const Tasks = (0, mongoose_1.model)("tasks", TaskSchema);
exports.TaskFileSchema = (0, mongoose_1.model)("attachedFiles", exports.FilesSchema);
exports.default = Tasks;
