import Joi from "joi";
import _ from "lodash";
import { model, Schema } from "mongoose";
import logger from "../../logger";
import TrelloActionsController from "../controllers/trello";
import { createBoardResponse } from "../types/controller/trello";
import {
  IDepartment,
  IDepartmentState,
  ListTypes,
  ITeam,
} from "../types/model/Department";
import Tasks from "./Task";
import config from "config";

const DepartmentSchema = new Schema<IDepartment>(
  {
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
              values: [...ListTypes, "projects"],
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
  },
  {
    timestamps: true,
    strict: false,
  }
);
const teamsSchema = (teams: string[]) =>
  Joi.array()
    .items({
      _id: Joi.object().optional().label("teams._id"),
      name: Joi.string()
        .required()
        .min(2)
        .max(62)
        .invalid(...teams)
        .label("department teams's name")
        .messages({
          "any.required": "Department Team name is required",
          "string.min":
            "Department team name should contains at least 2 char, and max 61 chars.",
          "string.max":
            "Department team name should contains at least 2 char, and max 61 chars.",
          "any.invalid": "Department teams should have a unique names",
        }),
      listId: Joi.string().required().label("teams.listId").allow(""),
      isDeleted: Joi.boolean()
        .label("teams.isDeleted")
        .required()
        .default(false),
    })
    .required()
    .label("department teams");
const listSchema = Joi.array()
  .required()
  .min(7)
  .items({
    _id: Joi.object().optional(),
    name: Joi.string()
      .label("lists.name")
      .valid(
        "In Progress",
        "Shared",
        "Review",
        "Done",
        "Not Clear",
        "Tasks Board",
        "Cancled"
      ),
    listId: Joi.string().required().allow("").label("list id"),
  });

const sideListSchema = Joi.array()
  .required()
  .items({
    _id: Joi.object().optional(),
    name: Joi.string().label("list name"),
    listId: Joi.string().required().allow("").label("list id"),
  });

const createDepartmentValidationSchema = Joi.object({
  _id: Joi.object().optional(),
  name: Joi.string().required().max(64).min(2).label("Department name"),
  color: Joi.string()
    .valid(
      "blue",
      "orange",
      "green",
      "red",
      "purple",
      "pink",
      "lime",
      "sky",
      "grey"
    )
    .required()
    .label("Department color"),
  boardUrl: Joi.optional().allow(null),
  boardId: Joi.string().label("board id").allow(""),
}).concat(
  Joi.object({
    teams: teamsSchema([]),
    lists: listSchema,
    sideLists: sideListSchema,
  })
);

const updateDepartmentValidateSchema = (teams: string[]) =>
  Joi.object({
    name: Joi.string().required().max(64).min(2).label("Department name"),
    color: Joi.string()
      .valid(
        "blue",
        "orange",
        "green",
        "red",
        "purple",
        "pink",
        "lime",
        "sky",
        "grey"
      )
      .required()
      .label("Department color"),
    addTeams: Joi.array()
      .items(
        Joi.string()
          .invalid(...teams)
          .label("department teams's name")
          .messages({
            "any.invalid": "Department teams should have a unique names",
          })
      )
      .optional(),
    removeTeams: Joi.array().items(Joi.string()).optional(),
    removeSideLists: Joi.array().items(Joi.string()).optional(),
    addSideLists: Joi.array().items(Joi.string()).optional(),
  });
// Validate hooks
DepartmentSchema.post(
  "save",
  async function (error: any, doc: IDepartment, next: any) {
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
      } else next({ error: "MongoError", message: errMsg });
    } else {
      next();
    }
  }
);
DepartmentSchema.pre<IDepartment>("remove", async function (next) {
  const current = this as IDepartment;
  let boardId = current.boardId;
  let result = await Tasks.deleteMany({ boardId: boardId });
  logger.info({ deleteTasksOfDepartment: result });
});
DepartmentSchema.post(
  "updateOne",
  { document: true, query: false },
  async function (error: any, doc: IDepartment, next: any) {
    if (error) {
      let err = {
        errorName: error.name,
        errorMessage: error.message,
        errorCode: error.code,
      };
      if (error.name === "MongoServerError") {
        next(err);
      } else next(error);
    } else next();
  }
);

//Methods
DepartmentSchema.methods.createDepartmentValidate = function (
  this: IDepartment
) {
  try {
    let validationResult = createDepartmentValidationSchema.validate(
      this.toObject()
    );
    return validationResult;
  } catch (error) {
    logger.error({ createDepartmentValidate: error });
  }
};
DepartmentSchema.methods.updateDepartmentValidate = function (
  this: IDepartment,
  data: IDepartmentState
) {
  try {
    let teams = this.teams.filter((item) => item.isDeleted === false);
    teams = teams.filter(
      (item) => !data.removeTeams.includes(item._id.toString())
    );
    let teamName = teams.map((item) => item.name);
    let validateFun = updateDepartmentValidateSchema(teamName);
    let validation = validateFun.validate(data);
    return validation;
  } catch (error) {
    logger.error({ updateDepartmentValidateSchemaError: error });
  }
};

DepartmentSchema.methods.createDepartmentBoard = async function (
  this: IDepartment
) {
  try {
    let teams = _.uniqBy([...this.teams], "name"),
      sideLists = _.uniqBy([...this.sideLists], "name"),
      lists = [...this.lists],
      board: createBoardResponse | any,
      result: { id: string } | any;
    // 1- create board
    board = await TrelloActionsController.createNewBoard(this.name, this.color);
    if (board.id && board.url) {
      this.boardId = board.id;
      this.boardURL = board.url;
      await TrelloActionsController.createWebHook(
        board.id,
        "trelloWebhookUrlTask"
      );
    } else
      return {
        error: "Boart Error",
        message: "Board not created, please see Trello roles first.",
      };

    //2- create lists
    let departmentLists = lists;
    let listsResult = await departmentLists.map(async (list, index) => {
      result = await TrelloActionsController.addListToBoard(
        board.id,
        list.name
      );
      list.listId = result.id;
      return list;
    });
    let sideListsIds = await sideLists.map(async (item) => {
      result = await TrelloActionsController.addListToBoard(
        board.id,
        item.name
      );
      item.listId = result.id;
      return item;
    });
    lists = await Promise.all(listsResult);
    sideLists = await Promise.all(sideListsIds);
    // 3- create teams
    let teamsResult = await teams.map(async (team, index) => {
      result = await TrelloActionsController.addListToBoard(
        board.id,
        team.name
      );
      team.listId = result.id;
      return team;
    });
    teams = await Promise.all(teamsResult);
    return { teams, lists, sideLists };
  } catch (error) {
    logger.error({ createDepartmentBoardError: error });
  }
};

DepartmentSchema.methods.updateDepartment = async function (
  this: IDepartment,
  data: IDepartmentState
) {
  try {
    await TrelloActionsController.updateBoard(this.boardId, {
      name: data.name,
      color: data.color,
    });
    this.name = data.name;
    this.color = data.color;
    await this.updateTeams(data);
    await this.updateSideLists(data);
    return this;
  } catch (error) {
    logger.error({ updateDepartmentError: error });
    return error;
  }
};

DepartmentSchema.methods.deleteDepartment = async function (this: IDepartment) {
  try {
    let board = await TrelloActionsController.deleteBoard(this.boardId);
    return await this.remove();
  } catch (error) {
    logger.error({ deleteDepartmentError: error });
    return error;
  }
};

DepartmentSchema.methods.updateTeams = async function (
  this: IDepartment,
  data: IDepartmentState,
  cb?: (doc: IDepartment) => any
) {
  try {
    let tasksBoardList = this.lists.find(
      (item) => item.name === "In Progress"
    ).listId;
    let depTeams: ITeam[] = [];
    // remove teams
    await data.removeTeams.forEach(async (item, index) => {
      let team = this.teams.find((t) => t._id.toString() === item);
      await TrelloActionsController.__moveAllCardsInList(
        team.listId,
        this.boardId,
        tasksBoardList
      );
      await TrelloActionsController.addListToArchieve(team.listId);
    });
    this.teams = this.teams.map((item) => {
      if (data.removeTeams.includes(item._id.toString())) {
        item.isDeleted = true;
      }
      return item;
    });
    depTeams = await Promise.all(
      data.addTeams.map(async (item) => {
        let list: { id: string } | any =
          await TrelloActionsController.addListToBoard(this.boardId, item);
        return { name: item, listId: list.id, isDeleted: false };
      })
    );
    depTeams = [...this.teams, ...depTeams];
    this.teams = depTeams;
    return this;
  } catch (error: any) {
    logger.error({ updateTeamsError: error });
    return error;
  }
};

DepartmentSchema.methods.updateSideLists = async function (
  this: IDepartment,
  data: IDepartmentState,
  cb?: (doc: IDepartment) => any
) {
  try {
    await data.removeSideLists.forEach(async (item, index) => {
      let list = this.sideLists.find((l) => l._id.toString() === item);
      await TrelloActionsController.addListToArchieve(list.listId);
    });
    this.sideLists = this.sideLists.filter(
      (item) => !data.removeSideLists.includes(item._id.toString())
    );
    let depSideLists = await Promise.all(
      await data.addSideLists.map(async (item, index) => {
        let list: { id: string } | any =
          await TrelloActionsController.addListToBoard(this.boardId, item);
        return { name: item, listId: list.id };
      })
    );
    this.sideLists = [...this.sideLists, ...depSideLists];
    return this;
  } catch (error) {
    logger.error({ updateSideListsError: error });
    return error;
  }
};

const Department = model<IDepartment>("department", DepartmentSchema);
export default Department;
