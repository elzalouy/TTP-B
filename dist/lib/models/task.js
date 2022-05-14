"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TaskSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "projects",
        required: true,
    },
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "categories",
        default: null,
    },
    memberId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: ["inProgress", "shared", "done", "not clear", "cancled", "review"],
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
}, {
    timestamps: true,
    strict: false,
});
const Tasks = (0, mongoose_1.model)("tasks", TaskSchema);
exports.default = Tasks;
