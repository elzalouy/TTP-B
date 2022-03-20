"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const DepartmentSchema = new mongoose_1.Schema(// department
{
    name: {
        type: String,
        required: true,
    },
    boardId: {
        type: String,
        required: true,
        unique: true,
    },
    color: {
        type: String,
    },
    defaultListId: {
        type: String,
    },
    sharedListID: {
        type: String,
    },
    doneListId: {
        type: String,
    },
    notClearListId: {
        type: String,
    },
    canceldListId: {
        type: String,
    },
    reviewListId: {
        type: String,
    },
    mainBoard: {
        type: Boolean,
        default: false
    },
    teamsId: [
        {
            idInTrello: String,
            idInDB: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: "teams",
            }
        },
    ],
}, {
    timestamps: true,
    strict: false,
});
const Department = (0, mongoose_1.model)("department", DepartmentSchema);
exports.default = Department;
