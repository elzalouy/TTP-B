"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TechMemberSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    departmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "departments",
        required: true,
    },
}, {
    timestamps: true,
    strict: false,
});
const TechMember = (0, mongoose_1.model)("techMembers", TechMemberSchema);
exports.default = TechMember;
