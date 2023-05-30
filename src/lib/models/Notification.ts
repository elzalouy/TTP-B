import { model, Schema, Model } from "mongoose";
import { IsNotified, NotificationInfo } from "../types/model/Notification";

const IsNotifiedUsers: Schema = new Schema<IsNotified>({
  userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  isNotified: { type: Schema.Types.Boolean, required: true, default: false },
});

const NotificationSchema: Schema<NotificationInfo> = new Schema<NotificationInfo>(
  {
    title: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    isNotified: { required: true, type: [IsNotifiedUsers] },
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
