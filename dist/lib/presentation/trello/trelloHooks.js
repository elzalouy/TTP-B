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
const errorUtils_1 = require("../../utils/errorUtils");
const logger_1 = __importDefault(require("../../../logger"));
const task_actions_Queue_1 = require("../../backgroundJobs/actions/task.actions.Queue");
const trelloHooks_1 = __importDefault(require("../../controllers/trelloHooks"));
class TrelloHooks {
    static handleWebHookUpdateProject(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let hook = new trelloHooks_1.default(req.body, "project");
                yield hook.start();
                return res.send("Done");
            }
            catch (error) {
                logger_1.default.error({ handleCreateCardInBoardError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleWebhookUpdateCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                task_actions_Queue_1.updateTaskQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
                    let hook = new trelloHooks_1.default(req.body, "task");
                    let data = yield hook.start();
                    return res.send("Done");
                }));
            }
            catch (error) {
                logger_1.default.error({ handleWebhookUpdateCardError: error });
            }
        });
    }
}
exports.default = TrelloHooks;
