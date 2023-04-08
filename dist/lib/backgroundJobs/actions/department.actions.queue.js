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
exports.createProjectsCardsInCreativeBoard = exports.departmentsQueue = void 0;
const queue_1 = __importDefault(require("queue"));
const trello_1 = __importDefault(require("../../controllers/trello"));
const Project_1 = __importDefault(require("../../models/Project"));
exports.departmentsQueue = (0, queue_1.default)({ results: [], autostart: true });
const createProjectsCardsInCreativeBoard = (board) => {
    let lists = board === null || board === void 0 ? void 0 : board.lists;
    exports.departmentsQueue.push((cb) => __awaiter(void 0, void 0, void 0, function* () {
        let isProjectsList = lists === null || lists === void 0 ? void 0 : lists.find((item) => item.name === "projects");
        if (isProjectsList) {
            let projects = yield Project_1.default.find({});
            projects.forEach((item) => __awaiter(void 0, void 0, void 0, function* () {
                if (item.cardId === null) {
                    let { id } = yield trello_1.default.__createProject(isProjectsList.listId, {
                        name: item.name,
                        projectDeadline: item.projectDeadline,
                        startDate: item.startDate,
                    });
                    if (id) {
                        item.cardId = id;
                        item.boardId = board.boardId;
                        item.listId = isProjectsList.listId;
                        yield item.save();
                    }
                }
            }));
        }
        cb(null, true);
    }));
};
exports.createProjectsCardsInCreativeBoard = createProjectsCardsInCreativeBoard;
