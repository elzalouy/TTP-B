"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TechMemberSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    listId: {
        type: String,
        required: true,
    },
    trelloMemberId: {
        type: String,
        required: true,
    },
    department: {
        type: String,
        default: null
    },
    boardId: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
    strict: false
});
const TechMember = (0, mongoose_1.model)("techMembers", TechMemberSchema);
exports.default = TechMember;
