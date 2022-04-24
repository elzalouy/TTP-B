import { ObjectId } from "bson";
import { Document } from "mongoose";

export interface NotificationInfo extends Document {
  description: string;
  projectManagerID: ObjectId;
  adminViewed:boolean
  projectManagerViewed:boolean
  title: string;
  projectID: ObjectId;
  clientName: string;
  adminUserID: ObjectId;
}

export interface NotificationData {
  _id?: string;
  description?: string;
  projectManagerID?: string;
  viewed?: boolean;
  title?: string;
  projectID?: string;
  clientName?: string;
  adminUserID?: string;
  adminViewed?:boolean
  projectManagerViewed?:boolean
}
