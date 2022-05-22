"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BoardSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    boardId: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    strict: false
});
const Boards = (0, mongoose_1.model)("boards", BoardSchema);
exports.default = Boards;
