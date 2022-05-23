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
    projectManagerName: {
        type: String,
        required: true,
    },
    adminId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
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
            "Not Started",
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
