"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const IsNotifiedUsers = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "users", required: true },
    isNotified: { type: mongoose_1.Schema.Types.Boolean, required: true, default: false },
});
const NotificationSchema = new mongoose_1.Schema({
    title: {
        type: String,
    },
    description: {
        type: String,
        required: true,
    },
    isNotified: { required: true, type: [IsNotifiedUsers] },
}, {
    timestamps: true,
    strict: false,
});
const Notification = (0, mongoose_1.model)("notification", NotificationSchema);
exports.default = Notification;
