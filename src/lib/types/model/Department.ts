import { Document } from "mongoose";
import Joi from "joi";
import { ObjectId } from "mongodb";

export const ListTypes = [
  "Tasks Board",
  "In Progress",
  "Shared",
  "Review",
  "Done",
  "Not Clear",
  "Cancled",
];
export const CreativeListTypes = [...ListTypes, "projects"];
export interface IDepartment extends Document {
  _id?: string;
  name: string;
  boardId: string;
  lists: IList[];
  color: string;
  teams: ITeam[];
  boardURL?: string;
  sideLists: IList[];
  /**
   * createDepartmentValidate
   *
   * It's a validation function for the new department document in the request, it will check all roles needed to be achieved to save this doc.
   */
  createDepartmentValidate(): Joi.ValidationResult<any>;
  createDepartmentBoard(cb?: (doc: IDepartment) => any): IDepartment;
  deleteDepartment(cb?: (doc: IDepartment) => any): IDepartment;
  updateDepartmentValidate(
    data: IDepartmentState,
    cb?: (doc: IDepartment) => any
  ): Joi.ValidationResult<any>;
  updateDepartment(
    data?: IDepartmentState,
    cb?: (doc: IDepartment) => any
  ): IDepartment;
  updateTeams(
    data: IDepartmentState,
    cb?: (doc: IDepartment) => any
  ): IDepartment;
  updateSideLists(
    this: IDepartment,
    data: IDepartmentState,
    cb?: (doc: IDepartment) => any
  ): IDepartment;
  updateLists(this: IDepartment, cb?: (doc: IDepartment) => any): IList[];
}

export interface IDepartmentState {
  _id?: string;
  name?: string;
  lists?: IList[];
  color?: string;
  teams?: ITeam[];
  sideLists?: IList[];
  teamsFromTrello?: ITeam[];
  boardId?: string;
  boardURL?: string;
  removeTeams?: string[];
  addTeams?: string[];
  removeSideLists?: string[];
  addSideLists?: string[];
}

export interface ITeam {
  _id?: string | ObjectId;
  name: string;
  listId: string;
  isDeleted: boolean;
}
export interface IList {
  _id?: string | ObjectId;
  name: string;
  listId: string;
}
