import { model, Schema, Model } from "mongoose";
import { NotificationInfo } from "../types/model/Notification";

const NotificationSchema: Schema = new Schema<NotificationInfo>(
  {
    description: {
      type: String,
      required: true,
    },
    projectManagerID: {
      type: Schema.Types.ObjectId,
      ref: "users",
      // required: true,
    },
    adminViewed: {
      type: Boolean,
      default: false,
    },
    projectManagerViewed:{
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
    },
    projectID: {
      type: Schema.Types.ObjectId,
      ref: "projects",
      // required: true,
    },
    clientName: {
      type: String,
      // require: true,
    },
    adminUserID: {
        type: Schema.Types.ObjectId,
        ref: "users",
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Notification: Model<NotificationInfo> = model(
  "notification",
  NotificationSchema
);

export default Notification;
