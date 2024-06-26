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
const joi_1 = __importDefault(require("joi"));
const lodash_1 = __importDefault(require("lodash"));
const mongoose_1 = require("mongoose");
const logger_1 = __importDefault(require("../../logger"));
const trello_1 = __importDefault(require("../controllers/trello"));
const Department_1 = require("../types/model/Department");
const Task_1 = __importDefault(require("./Task"));
const DepartmentSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    boardId: {
        type: String,
        unique: true,
    },
    color: {
        type: String,
        required: true,
    },
    boardURL: {
        type: String,
    },
    teams: {
        type: [
            {
                name: {
                    type: String,
                    required: [true, "Team name is required with min length 2 chars"],
                    minlength: [2, "Team name is required with min length 2 chars"],
                },
                listId: { type: String, unique: true },
                isDeleted: Boolean,
            },
        ],
        required: true,
        default: [],
    },
    sideLists: {
        type: [
            {
                name: { type: String, required: true },
                listId: { type: String, required: true, unique: true },
            },
        ],
        required: true,
        default: [],
    },
    lists: {
        type: [
            {
                name: {
                    type: String,
                    enum: {
                        values: [...Department_1.ListTypes, "projects"],
                        message: `{VALUE} is not one of the list types ["Tasks Board", "In Progress", "Shared", "Review", "Done", "Not Clear","Cancled"]`,
                    },
                },
                listId: { type: String, required: true, unique: true },
            },
        ],
        required: true,
        min: 7,
        default: [],
    },
}, {
    timestamps: true,
    strict: false,
});
const teamsSchema = (teams) => joi_1.default.array()
    .items({
    _id: joi_1.default.object().optional().label("teams._id"),
    name: joi_1.default.string()
        .required()
        .min(2)
        .max(62)
        .invalid(...teams)
        .label("department teams's name")
        .messages({
        "any.required": "Department Team name is required",
        "string.min": "Department team name should contains at least 2 char, and max 61 chars.",
        "string.max": "Department team name should contains at least 2 char, and max 61 chars.",
        "any.invalid": "Department teams should have a unique names",
    }),
    listId: joi_1.default.string().required().label("teams.listId").allow(""),
    isDeleted: joi_1.default.boolean()
        .label("teams.isDeleted")
        .required()
        .default(false),
})
    .required()
    .label("department teams");
const listSchema = joi_1.default.array()
    .required()
    .min(7)
    .items({
    _id: joi_1.default.object().optional(),
    name: joi_1.default.string()
        .label("lists.name")
        .valid("In Progress", "Shared", "Review", "Done", "Not Clear", "Tasks Board", "Cancled"),
    listId: joi_1.default.string().required().allow("").label("list id"),
});
const sideListSchema = joi_1.default.array()
    .required()
    .items({
    _id: joi_1.default.object().optional(),
    name: joi_1.default.string().label("list name"),
    listId: joi_1.default.string().required().allow("").label("list id"),
});
const createDepartmentValidationSchema = joi_1.default.object({
    _id: joi_1.default.object().optional(),
    name: joi_1.default.string().required().max(64).min(2).label("Department name"),
    color: joi_1.default.string()
        .valid("blue", "orange", "green", "red", "purple", "pink", "lime", "sky", "grey")
        .required()
        .label("Department color"),
    boardUrl: joi_1.default.optional().allow(null),
    boardId: joi_1.default.string().label("board id").allow(""),
}).concat(joi_1.default.object({
    teams: teamsSchema([]),
    lists: listSchema,
    sideLists: sideListSchema,
}));
const updateDepartmentValidateSchema = (teams) => joi_1.default.object({
    name: joi_1.default.string().required().max(64).min(2).label("Department name"),
    color: joi_1.default.string()
        .valid("blue", "orange", "green", "red", "purple", "pink", "lime", "sky", "grey")
        .required()
        .label("Department color"),
    addTeams: joi_1.default.array()
        .items(joi_1.default.string()
        .invalid(...teams)
        .label("department teams's name")
        .messages({
        "any.invalid": "Department teams should have a unique names",
    }))
        .optional(),
    removeTeams: joi_1.default.array().items(joi_1.default.string()).optional(),
    removeSideLists: joi_1.default.array().items(joi_1.default.string()).optional(),
    addSideLists: joi_1.default.array().items(joi_1.default.string()).optional(),
});
// Validate hooks
DepartmentSchema.post("save", function (error, doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let errMsg = {
            errorName: error.name,
            errorMessage: error.message,
            errorCode: error.code,
        };
        if (error.name === "MongoServerError") {
            if (error.code === 11000) {
                next({
                    id: doc._id.toString(),
                    boardId: doc.boardId,
                    error: "MongoError",
                    message: "Departments and teams names should be unique",
                });
            }
            else
                next({ error: "MongoError", message: errMsg });
        }
        else {
            next();
        }
    });
});
DepartmentSchema.pre("remove", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const current = this;
        let boardId = current.boardId;
        let result = yield Task_1.default.deleteMany({ boardId: boardId });
        logger_1.default.warn({ deleteTasksOfDepartment: result });
    });
});
DepartmentSchema.post("updateOne", { document: true, query: false }, function (error, doc, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (error) {
            let err = {
                errorName: error.name,
                errorMessage: error.message,
                errorCode: error.code,
            };
            if (error.name === "MongoServerError") {
                next(err);
            }
            else
                next(error);
        }
        else
            next();
    });
});
//Methods
DepartmentSchema.methods.createDepartmentValidate = function () {
    try {
        let validationResult = createDepartmentValidationSchema.validate(this.toObject());
        return validationResult;
    }
    catch (error) {
        logger_1.default.error({ createDepartmentValidate: error });
    }
};
DepartmentSchema.methods.updateDepartmentValidate = function (data) {
    try {
        let teams = this.teams.filter((item) => item.isDeleted === false);
        teams = teams.filter((item) => !data.removeTeams.includes(item._id.toString()));
        let teamName = teams.map((item) => item.name);
        let validateFun = updateDepartmentValidateSchema(teamName);
        let validation = validateFun.validate(data);
        return validation;
    }
    catch (error) {
        logger_1.default.error({ updateDepartmentValidateSchemaError: error });
    }
};
DepartmentSchema.methods.createDepartmentBoard = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let teams = lodash_1.default.uniqBy([...this.teams], "name"), sideLists = lodash_1.default.uniqBy([...this.sideLists], "name"), lists = [...this.lists], board, result;
            // 1- create board
            board = yield trello_1.default.createNewBoard(this.name, this.color);
            if (board.id && board.url) {
                this.boardId = board.id;
                this.boardURL = board.url;
                yield trello_1.default.createWebHook(board.id, "trelloWebhookUrlTask");
            }
            else
                return {
                    error: "Boart Error",
                    message: "Board not created, please see Trello roles first.",
                };
            //2- create lists
            let departmentLists = lists;
            let listsResult = yield departmentLists.map((list, index) => __awaiter(this, void 0, void 0, function* () {
                result = yield trello_1.default.addListToBoard(board.id, list.name);
                list.listId = result.id;
                return list;
            }));
            let sideListsIds = yield sideLists.map((item) => __awaiter(this, void 0, void 0, function* () {
                result = yield trello_1.default.addListToBoard(board.id, item.name);
                item.listId = result.id;
                return item;
            }));
            lists = yield Promise.all(listsResult);
            sideLists = yield Promise.all(sideListsIds);
            // 3- create teams
            let teamsResult = yield teams.map((team, index) => __awaiter(this, void 0, void 0, function* () {
                result = yield trello_1.default.addListToBoard(board.id, team.name);
                team.listId = result.id;
                return team;
            }));
            teams = yield Promise.all(teamsResult);
            return { teams, lists, sideLists };
        }
        catch (error) {
            logger_1.default.error({ createDepartmentBoardError: error });
        }
    });
};
DepartmentSchema.methods.updateDepartment = function (data) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield trello_1.default.updateBoard(this.boardId, {
                name: data.name,
                color: data.color,
            });
            this.name = data.name;
            this.color = data.color;
            yield this.updateTeams(data);
            yield this.updateSideLists(data);
            return this;
        }
        catch (error) {
            logger_1.default.error({ updateDepartmentError: error });
            return error;
        }
    });
};
DepartmentSchema.methods.deleteDepartment = function () {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let board = yield trello_1.default.deleteBoard(this.boardId);
            return yield this.remove();
        }
        catch (error) {
            logger_1.default.error({ deleteDepartmentError: error });
            return error;
        }
    });
};
DepartmentSchema.methods.updateTeams = function (data, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let tasksBoardList = this.lists.find((item) => item.name === "In Progress").listId;
            let depTeams = [];
            // remove teams
            yield data.removeTeams.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                let team = this.teams.find((t) => t._id.toString() === item);
                yield trello_1.default.__moveAllCardsInList(team.listId, this.boardId, tasksBoardList);
                yield trello_1.default.addListToArchieve(team.listId);
            }));
            this.teams = this.teams.map((item) => {
                if (data.removeTeams.includes(item._id.toString())) {
                    item.isDeleted = true;
                }
                return item;
            });
            depTeams = yield Promise.all(data.addTeams.map((item) => __awaiter(this, void 0, void 0, function* () {
                let list = yield trello_1.default.addListToBoard(this.boardId, item);
                return { name: item, listId: list.id, isDeleted: false };
            })));
            depTeams = [...this.teams, ...depTeams];
            this.teams = depTeams;
            return this;
        }
        catch (error) {
            logger_1.default.error({ updateTeamsError: error });
            return error;
        }
    });
};
DepartmentSchema.methods.updateSideLists = function (data, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield data.removeSideLists.forEach((item, index) => __awaiter(this, void 0, void 0, function* () {
                let list = this.sideLists.find((l) => l._id.toString() === item);
                yield trello_1.default.addListToArchieve(list.listId);
            }));
            this.sideLists = this.sideLists.filter((item) => !data.removeSideLists.includes(item._id.toString()));
            let depSideLists = yield Promise.all(yield data.addSideLists.map((item, index) => __awaiter(this, void 0, void 0, function* () {
                let list = yield trello_1.default.addListToBoard(this.boardId, item);
                return { name: item, listId: list.id };
            })));
            this.sideLists = [...this.sideLists, ...depSideLists];
            return this;
        }
        catch (error) {
            logger_1.default.error({ updateSideListsError: error });
            return error;
        }
    });
};
const Department = (0, mongoose_1.model)("department", DepartmentSchema);
exports.default = Department;
