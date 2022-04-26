"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const NotificationSchema = new mongoose_1.Schema({
    description: {
        type: String,
        required: true,
    },
    projectManagerID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    viewed: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
    },
    projectID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "projects",
        required: true,
    },
    clientName: {
        type: String,
        require: true,
    },
    adminUserID: {
        idInDB: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "users",
        },
    },
}, {
    timestamps: true,
    strict: false,
});
const Notification = (0, mongoose_1.model)("notification", NotificationSchema);
exports.default = Notification;
