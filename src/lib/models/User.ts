import { model, Schema, Model } from "mongoose";
import { IUser } from "../types/model/User";

const UserSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: false,
      default: null,
    },
    role: {
      type: String,
      required: false,
      enum: ["OM", "PM", "SM"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: "",
    },
    trelloMemberId: {
      type: String,
      default: null,
    },
    userTeams: [
      // remove this
      {
        type: Schema.Types.ObjectId,
        ref: "teams",
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

const User: Model<IUser> = model("users", UserSchema);

export default User;
