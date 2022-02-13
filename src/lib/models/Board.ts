import { model, Schema, Model } from "mongoose";
import { Board } from "../types/model/Board";

const BoardSchema: Schema = new Schema<Board>(
  {
    name: {
      type: String,
      required: true,
    },
    boardId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    strict:false
  }
);

const Boards: Model<Board> = model("boards", BoardSchema);

export default Boards;
