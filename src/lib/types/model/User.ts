import { Document  } from "mongoose";
export type MemberType = 'admin'| 'normal' | 'observer'

// user account : SuperAdmin or ProjectManager
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    trelloBoardId:string;
    trelloMemberId:string;
    image:string;
    type:MemberType;
    userTeams?: string[];
  }

  export interface UserData{
    id?:string;
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    trelloBoardId?:string;
    trelloMemberId?:string;
    image?:string;
    type?:MemberType;
    userTeams?: string[];
  }

  export interface PasswordUpdate extends UserData{
    oldPassword: string;
  }