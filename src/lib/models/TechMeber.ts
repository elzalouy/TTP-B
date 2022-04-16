import { model, Schema, Model } from "mongoose";
import { ITech } from "../types/model/Team";

const TechMemberSchema: Schema = new Schema<ITech>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      default: null,
    },
    listId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

const TechMember: Model<ITech> = model("techMembers", TechMemberSchema);

export default TechMember;
