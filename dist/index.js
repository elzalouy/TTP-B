"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const server_1 = require("./lib/server");
// .env
(0, dotenv_1.config)();
server_1.http.listen(process.env.PORT, function () {
    console.log("server listen to port " + process.env.PORT);
});
