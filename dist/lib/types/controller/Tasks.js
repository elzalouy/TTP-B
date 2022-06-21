"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskNotFoundError = exports.provideCardIdError = exports.deleteFilesError = void 0;
exports.deleteFilesError = {
    error: {
        path: "deleteFiles",
        message: "delete files should have a valid file data.",
    },
    task: null,
};
exports.provideCardIdError = {
    error: {
        path: "cardId",
        message: "Card id should be provided while uploading files or deleting files.",
    },
    task: null,
};
exports.taskNotFoundError = {
    error: {
        path: "task",
        message: "Task not found",
    },
    task: null,
};
