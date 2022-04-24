import { ObjectID, ObjectId } from "bson";
import { Document } from "mongoose";
export interface ProjectInfo extends Document {
  name: string;
  projectManager: ObjectId;
  projectDeadline: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver before deadline"
    | "delivered after deadline";
  clientId: ObjectId;
  numberOfTasks: number;
  numberOfFinishedTasks: number;
}
export interface ProjectData {
  _id?: string | ObjectID;
  name?: string;
  projectManager?: string;
  projectDeadline?: Date;
  startDate?: Date | number;
  completedDate?: Date;
  projectStatus?:
    | "inProgress"
    | "deliver on time"
    | "late"
    | "deliver defore deadline"
    | "delivered after deadline";
  clientId?: string;
  numberOfTasks?: number;
  numberOfFinishedTasks?: number;
  projectManagerName?:string;
  adminName?:string
}
