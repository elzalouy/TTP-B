"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TeamsSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "departments",
        default: null,
    },
    listId: {
        type: String,
        default: null,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
    strict: true,
});
const Teams = (0, mongoose_1.model)("teams", TeamsSchema);
exports.default = Teams;
