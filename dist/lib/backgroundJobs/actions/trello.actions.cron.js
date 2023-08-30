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
exports.postAsnaphotOfTrelloActions = exports.initializeSystemTasksJob = exports.initializeTrelloMembersJob = exports.initializeTrelloBoardsJob = void 0;
const cron_1 = require("cron");
const dbConnect_1 = require("../../startup/db/dbConnect");
const trello_1 = __importDefault(require("../../controllers/trello"));
function initializeTrelloBoardsJob() {
    return new cron_1.CronJob("0 6 * * *", () => __awaiter(this, void 0, void 0, function* () {
        (0, dbConnect_1.initializeTrelloBoards)();
    }), null, true, "Asia/Riyadh", null, true);
}
exports.initializeTrelloBoardsJob = initializeTrelloBoardsJob;
function initializeTrelloMembersJob() {
    return new cron_1.CronJob("0 6 * * *", () => __awaiter(this, void 0, void 0, function* () {
        yield (0, dbConnect_1.initializeTrelloMembers)();
    }), null, true, "Asia/Riyadh", null, true);
}
exports.initializeTrelloMembersJob = initializeTrelloMembersJob;
function initializeSystemTasksJob() {
    return new cron_1.CronJob("0 6 * * *", () => __awaiter(this, void 0, void 0, function* () {
        yield (0, dbConnect_1.initializeTTPTasks)();
    }), null, true, "Asia/Riyadh", null, true);
}
exports.initializeSystemTasksJob = initializeSystemTasksJob;
function postAsnaphotOfTrelloActions() {
    return new cron_1.CronJob("* 12 * * *", () => __awaiter(this, void 0, void 0, function* () {
        yield trello_1.default.__postSnapshotOfActions();
    }), null, true, "Asia/Riyadh", null, true);
}
exports.postAsnaphotOfTrelloActions = postAsnaphotOfTrelloActions;
