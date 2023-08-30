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
const logger_1 = __importDefault(require("../../logger"));
const notifications_actions_cron_1 = require("../backgroundJobs/actions/notifications.actions.cron");
const project_actions_cron_1 = require("../backgroundJobs/actions/project.actions.cron");
const init_actions_queue_1 = require("../backgroundJobs/actions/init.actions.queue");
const dbConnect_1 = require("./db/dbConnect");
function default_1(io) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            init_actions_queue_1.initializeQueue.push(() => {
                (0, notifications_actions_cron_1.removeOldNotifications)(io).start();
            });
            init_actions_queue_1.initializeQueue.push(() => {
                (0, project_actions_cron_1.projectsDueDate)(io).start();
            });
            init_actions_queue_1.initializeQueue.push(() => {
                (0, project_actions_cron_1.projectsPassedDate)(io).start();
            });
            init_actions_queue_1.initializeQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
                yield (0, dbConnect_1.initializeTrelloBoards)().then(() => {
                    (0, dbConnect_1.initializeTTPTasks)().then(() => cb(null, true));
                });
            }));
            // initializeQueue.push(async (cb) => {
            //   postAsnaphotOfTrelloActions().start();
            // });
        }
        catch (error) {
            logger_1.default.error({ errorOldNotificationsCron: error });
        }
    });
}
exports.default = default_1;
