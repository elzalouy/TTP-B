import { model, Schema, Model } from "mongoose";
import { DepartmentInfo } from "../types/model/Department";

const DepartmentSchema: Schema = new Schema<DepartmentInfo>( // department
  {
    name: {
      type: String,
      required: true,
    },
    boardId: {
      type: String,
      required: true,
      unique: true,
    },
    color: {
      type: String,
    },
    defaultListId: {
      type: String,
    },
    sharedListID: {
      type: String,
    },
    doneListId: {
      type: String,
    },
    notClearListId: {
      type: String,
    },
    canceldListId: {
      type: String,
    },
    reviewListId: {
      type: String,
    },
    mainBoard: {
      type: Boolean,
      default: false,
    },
    teamsId: [
      {
        idInTrello: String,
        idInDB: {
          type: Schema.Types.ObjectId,
          ref: "teams",
        },
      },
    ],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "tasks",
      },
    ],
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Department: Model<DepartmentInfo> = model("department", DepartmentSchema);

export default Department;
