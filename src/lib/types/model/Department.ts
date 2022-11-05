import { Document } from "mongoose";
import Joi from "joi";

export const ListTypes = [
  "Tasks Board",
  "inProgress",
  "Shared",
  "Review",
  "Done",
  "Not Clear",
  "Cancled",
];
export interface IDepartment extends Document {
  _id?: string;
  name: string;
  boardId: string;
  lists: IList[];
  color: string;
  teams: ITeam[];
  boardURL?: string;
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
}

export interface IDepartmentState {
  _id?: string;
  name?: string;
  lists?: IList[];
  color?: string;
  teams?: ITeam[];
  boardURL?: string;
  removeTeams?: string[];
  addTeams?: string[];
}
export interface ITeam {
  _id?: string;
  name: string;
  listId: string;
  isDeleted: boolean;
}
export interface IList {
  _id?: string;
  name: string;
  listId: string;
}
