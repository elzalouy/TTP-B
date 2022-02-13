import { model, Schema, Model } from "mongoose";
import { ITech } from "../types/model/Team";

const TechMemberSchema: Schema = new Schema<ITech>(
  {
    name: {
      type: String,
      required: true,
    },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: "departments",
      required: true,
    }
  },
  {
    timestamps: true,
    strict:false
  }
);

const TechMember: Model<ITech> = model("techMembers", TechMemberSchema);

export default TechMember;
