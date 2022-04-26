"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = require("./lib/server");
// .env
(0, dotenv_1.config)();
const port = process.env.PORT || 3000;
server_1.http.listen(port, function () {
    console.log("server listen to port " + process.env.PORT);
});
