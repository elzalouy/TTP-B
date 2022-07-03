import { model, Schema, Model } from "mongoose";
import { TeamsInterface } from "../types/model/Team";

const TeamsSchema: Schema = new Schema<TeamsInterface>(
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
    isDeleted:{
      type:Boolean,
      default:false,
    }
  },
  {
    timestamps: true,
    strict: true,
  }
);

const Teams: Model<TeamsInterface> = model("teams", TeamsSchema);

export default Teams;
