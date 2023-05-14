import { ObjectID, ObjectId } from "bson";
import { Document } from "mongoose";

export interface DeadlineChain {
  userId: ObjectId;
  name: string;
  before: Date;
  current: Date;
  trelloMember: boolean;
}

export interface ProjectInfo extends Document {
  name: string;
  projectManager: ObjectId;
  projectDeadline: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "In Progress"
    | "deliver on time"
    | "late"
    | "deliver before deadline"
    | "delivered after deadline";
  clientId: ObjectId;
  numberOfTasks: number;
  numberOfFinishedTasks: number;
  adminId: ObjectId;
  projectManagerName: string;
  listId: string;
  boardId: string;
  cardId: string;
  associateProjectManager: string;
  deadlineChain: DeadlineChain[];
}

export interface ProjectData {
  _id?: string | ObjectID;
  name?: string;
  projectManager?: string;
  projectDeadline?: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "In Progress"
    | "deliver on time"
    | "late"
    | "deliver defore deadline"
    | "delivered after deadline";
  clientId?: string;
  numberOfTasks?: number;
  numberOfFinishedTasks?: number;
  projectManagerName?: string;
  adminName?: string;
  adminId?: ObjectId;
  listId?: string;
  boardId?: string;
  cardId?: string;
  associateProjectManager?: string;
}
