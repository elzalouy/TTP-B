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
const trelloHooks_1 = __importDefault(require("../../controllers/trelloHooks"));
const tasks_Route_Queue_1 = require("../../backgroundJobs/routes/tasks.Route.Queue");
const processedEvents = new Set();
class TrelloHooks {
    static handleWebHookUpdateProject(req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let payload = req.body;
                let eventId = (_a = payload === null || payload === void 0 ? void 0 : payload.action) === null || _a === void 0 ? void 0 : _a.id;
                if (!processedEvents.has(eventId)) {
                    processedEvents.add(eventId);
                    let hook = new trelloHooks_1.default(req.body, "project");
                    yield hook.start();
                    const timeoutPromise = new Promise((resolve) => {
                        setTimeout(() => {
                            processedEvents.delete(eventId);
                        }, 50000);
                    });
                    res.send("Done");
                }
                else
                    res.send("Implemented before");
            }
            catch (error) {
                logger_1.default.error({ handleWebHookUpdateProjectError: error });
                return res.status(500).send((0, errorUtils_1.customeError)("server_error", 500));
            }
        });
    }
    static handleWebhookUpdateCard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            tasks_Route_Queue_1.taskRoutesQueue.push((cb) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    let payload = req.body;
                    let eventId = (_a = payload === null || payload === void 0 ? void 0 : payload.action) === null || _a === void 0 ? void 0 : _a.id;
                    console.log({ eventId, eventHappened: processedEvents.has(eventId) });
                    if (!processedEvents.has(eventId) && eventId !== undefined) {
                        processedEvents.add(eventId);
                        let hook = new trelloHooks_1.default(req.body, "task");
                        yield hook.start();
                        const timeoutPromise = new Promise((resolve) => {
                            setTimeout(() => {
                                processedEvents.delete(eventId);
                            }, 50000);
                        });
                        res.send("Done");
                    }
                    else
                        res.send("Implemented before");
                }
                catch (error) {
                    logger_1.default.error({ handleWebhookUpdateCardError: error });
                }
            }));
        });
    }
}
exports.default = TrelloHooks;
