"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TeamsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    projectManagers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "users",
        },
    ],
    teamMembers: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "techmembers",
        },
    ],
    boardId: {
        type: String,
        required: true,
        unique: true,
    },
    defaultListId: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
    strict: false
});
const Team = (0, mongoose_1.model)("teams", TeamsSchema);
exports.default = Team;
