"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAll = void 0;
const fs = require("fs");
const Path = require("path");
function deleteAll() {
    let dir = __dirname.split("services");
    const directory = Path.join(dir[0], "uploads");
    fs.readdir(directory, (err, files) => {
        if (err)
            throw err;
        for (const file of files) {
            if (file !== ".placeholder")
                fs.unlink(Path.join(directory, file), (err) => {
                    if (err)
                        throw err;
                });
        }
    });
}
exports.deleteAll = deleteAll;
