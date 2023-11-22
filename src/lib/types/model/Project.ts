import { ObjectID, ObjectId } from "bson";
import { Document } from "mongoose";

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
    | "delivered after deadline"
    | "Not Started";
  clientId: ObjectId;
  numberOfTasks: number;
  numberOfFinishedTasks: number;
  adminId: ObjectId;
  projectManagerName: string;
  listId: string;
  boardId: string;
  cardId: string;
  associateProjectManager: string;
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
