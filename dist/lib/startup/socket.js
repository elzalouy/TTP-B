"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function appSocket(io) {
    io.on("connection", (socket) => {
        socket.on("disconnect", () => console.log("Client disconnected"));
        //* this for admins role only
        socket.on("joined admin", () => {
            // logger.info({ data });
            return socket.join("admin room");
        });
        //* this for project managers role only
        socket.on("joined manager", () => {
            // logger.info({ data });
            return socket.join("manager room");
        });
        //* this is for specific user
        socket.on("joined user", (data) => {
            return socket.join(`user-${data.id}`);
        });
    });
}
exports.default = appSocket;
