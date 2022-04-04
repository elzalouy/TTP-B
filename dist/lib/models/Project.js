"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    projectManager: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    membersId: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "techMembers",
        },
    ],
    numberOfTasks: {
        type: Number,
        default: 0,
    },
    numberOfFinshedTasks: {
        type: Number,
        default: 0,
    },
    projectDeadline: {
        type: Date,
        default: null,
    },
    startDate: {
        type: Date,
        default: Date.now(),
    },
    completedDate: {
        type: Date,
        default: null,
    },
    projectStatus: {
        type: String,
        default: "inProgress",
        enum: [
            "inProgress",
            "late",
            "delivered on time",
            "delivered defore deadline",
            "delivered after deadline",
        ],
    },
    clientId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "clients",
    },
}, {
    timestamps: true,
    strict: false,
});
const Project = (0, mongoose_1.model)("projects", ProjectSchema);
exports.default = Project;
