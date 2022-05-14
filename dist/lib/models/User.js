"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        required: false,
    },
    image: {
        type: String,
        default: "",
    },
    trelloMemberId: {
        type: String,
        default: null,
    },
    userTeams: [
        // remove this
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "teams",
        },
    ],
}, {
    timestamps: true,
    strict: false,
});
const User = (0, mongoose_1.model)("users", UserSchema);
exports.default = User;
