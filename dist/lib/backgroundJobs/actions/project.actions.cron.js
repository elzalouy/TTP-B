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
exports.projectsPassedDate = exports.projectsDueDate = void 0;
const notification_1 = __importDefault(require("../../dbCalls/notification/notification"));
const socket_1 = require("../../startup/socket");
const cron_1 = require("cron");
const Project_1 = __importDefault(require("../../models/Project"));
/**
 * projectsDueDate
 * It's a cron job initialized and called for geting the projects closed to their due dates.
 * @param io IO socket
 */
function projectsDueDate(io) {
    return new cron_1.CronJob("0 9-18/3 * * *", () => __awaiter(this, void 0, void 0, function* () {
        let today = new Date();
        let dueDateProjects = yield Project_1.default.find()
            .where("projectStatus")
            .equals(["In Progress", "late"])
            .where("projectDeadline")
            .lt(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).getTime())
            .where("startDate")
            .lt(new Date().getTime());
        console.log({ dueDateProjects });
        if (dueDateProjects && dueDateProjects.length > 0) {
            dueDateProjects.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                yield notification_1.default.__createNotification({
                    title: `${item.name} due date confirmation`,
                    description: `${item.name} has a soon due date, please be aware`,
                    isNotified: [{ userId: item.projectManager, isNotified: false }],
                });
            }));
            let ids = dueDateProjects.map((item) => item.projectManager.toString());
            let sockets = socket_1.socketPMs.filter((item) => ids.includes(item.id));
            let ioIds = sockets.map((item) => item.socketId);
            io.to(ioIds).emit("notification-update");
        }
    }), null, true, "Asia/Riyadh");
}
exports.projectsDueDate = projectsDueDate;
/**
 * projectsPassDate
 * it's a cron job for notifying the users with the passed due dates of the current project.
 */
function projectsPassedDate(io) {
    return new cron_1.CronJob("0 9-18/3 * * *", () => __awaiter(this, void 0, void 0, function* () {
        let passedDatesPojects = yield Project_1.default.find({
            projectStatus: { $in: ["In Progress", "late"] },
        })
            .where("projectStatus")
            .equals(["In Progress", "late"])
            .where("projectDeadline")
            .lte(new Date().getTime());
        console.log(new Date(), "2022-10-24T22:00:00.000+00:00");
        console.log({ passedDatesPojects });
        if (passedDatesPojects.length > 0) {
            passedDatesPojects.forEach((item) => __awaiter(this, void 0, void 0, function* () {
                yield notification_1.default.__createNotification({
                    title: `${item.name} passed due date`,
                    description: `${item.name} has passed the due date, be aware`,
                    isNotified: [{ userId: item.projectManager, isNotified: false }],
                });
                let ids = passedDatesPojects.map((item) => item.projectManager.toString());
                let sockets = socket_1.socketPMs.filter((item) => ids.includes(item.id));
                console.log({ sockets, socketPMs: socket_1.socketPMs });
                let ioIds = sockets.map((item) => item.socketId);
                io.to(ioIds).emit("notification-update");
            }));
        }
    }), null, true, "Asia/Riyadh");
}
exports.projectsPassedDate = projectsPassedDate;
