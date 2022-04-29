"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moment_1 = __importDefault(require("moment"));
const node_cron_1 = __importDefault(require("node-cron"));
const notification_1 = __importDefault(require("../../controllers/notification"));
const project_1 = __importDefault(require("../../dbCalls/project/project"));
const server_1 = require("../../server");
const tasks_1 = __importDefault(require("../../dbCalls/tasks/tasks"));
// '0 0 0 1-31 0-7'
//todo update notification cron job
exports.default = node_cron_1.default.schedule("* * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    //todo check if project is passed the deadline
    let projects = yield project_1.default.getProjectDB({
        projectStatus: { $in: ["inProgress", "late"] },
        projectDeadline: { $lt: new Date() },
    });
    if (projects.length > 1) {
        for (let i = 0; i < projects.length; i++) {
            let createNotifi = yield notification_1.default.createNotification({
                title: `${projects[i].name} Overdue`,
                projectManagerID: projects[i].projectManager,
                description: `${projects[i].name} project Due date ${(0, moment_1.default)(projects[i].projectDeadline).format("dd/mm/yyyy")}`,
                clientName: projects[i].clientId,
            });
            // send notification to all admin
            server_1.io.to("admin room").emit("notification update", createNotifi);
            // send notification to specific project manager
            server_1.io.to(`user-${projects[i].projectManager}`).emit("notification update", createNotifi);
        }
    }
    //todo check if the task pass the deadline
    let tasks = yield tasks_1.default.getAllTasksDB({
        status: { $in: ["inProgress"] },
        deadline: { $lt: new Date() },
    });
    if (tasks.length > 1) {
        for (let i = 0; i < tasks.length; i++) {
            // let createNotifi = await NotificationController.createNotification({
            //   title: `${tasks[i].name} Overdue`,
            //   projectManagerID: tasks[i].projectManager,
            //   description: `${tasks[i].name} project Due date ${moment(
            //     tasks[i].projectDeadline
            //   ).format("dd/mm/yyyy")}`,
            //   clientName: tasks[i].clientId,
            // });
            // send notification to all admin
            // io.to("admin room").emit("notification update", createNotifi);
            // send notification to specific project manager
            // io.to(`user-${projects[i].projectManager}`).emit(
            //   "notification update",
            //   createNotifi
            // );
        }
    }
}));
