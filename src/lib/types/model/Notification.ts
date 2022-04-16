import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface NotificationInfo extends Document {
  description: string;
  projectManagerID: ObjectId;
  viewed: boolean;
  title: string;
  projectID: ObjectId;
  clientName: string;
  adminUserID: ObjectId;
}

export interface NotificationData {
  id?: string;
  description?: string;
  projectManagerID?: ObjectId;
  viewed?: boolean;
  title?: string;
  projectID?: string;
  clientName?: string;
  adminUserID?: string;
}
