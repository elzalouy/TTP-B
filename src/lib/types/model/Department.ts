import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface DepartmentInfo extends Document {
  name: string;
  boardId: string;
  defaultListId: string;
  reviewListId: string;
  sharedListID: string;
  doneListId: string;
  notClearListId: string;
  canceldListId: string;
  color:string;
  // teamListIds:string[];
  // teamsIdInDB:ObjectId[];
  teamsId:{
    idInTrello:string;
    idInDB:any;
  }[]
}

export interface DepartmentData {
  id?: string;
  name?: string;
  color?:string;
  boardId?: string;
  defaultListId?: string;
  reviewListId?: string;
  sharedListID?: string;
  doneListId?: string;
  notClearListId?: string;
  canceldListId?: string;
  teams?:{id:string; name:string}[];
  mainBoard?:boolean|null;
  // teamListIds?:string[];
  // teamsIdInDB?:string[];
  teamsId?:{
    idInTrello:string;
    idInDB:any;
  }[]
}
