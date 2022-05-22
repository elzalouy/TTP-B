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
const task_1 = __importDefault(require("../controllers/task"));
const techMember_1 = __importDefault(require("../controllers/techMember"));
const Procedures = class Procedures {
    static deleteDepartmentProcedure(department) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let tasksResult = yield task_1.default.deleteTasksWhere({
                    boardId: department.boardId,
                });
                let techResult = yield techMember_1.default.deleteTechMemberWhere({
                    departmentId: department._id,
                });
                logger_1.default.info({
                    "delete Tasks": tasksResult,
                    "Delete Tech members": techResult,
                });
                return department;
            }
            catch (error) {
                logger_1.default.error({ deleteDepartmentProcedureError: error });
            }
        });
    }
};
exports.default = Procedures;
