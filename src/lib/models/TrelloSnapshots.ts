import { Schema, model } from "mongoose";
import {
  ITrelloActionsOfSnapshot,
  ITrelloSnapshot,
} from "../types/model/TrelloActionsSnapshots";

const TrelloSnapshotAction = new Schema<ITrelloActionsOfSnapshot>({
  id: String,
  idMemberCreator: String,
  data: {
    text: { type: String, required: false },
    card: {
      id: String,
      name: String,
      idShort: Number,
      desc: String,
    },
    board: {
      id: String,
      name: String,
      shortLink: String,
    },
    list: { id: String, name: String },
  },
  appCreator: {
    id: String,
  },
  type: String,
  date: String,
  limits: {
    Type: {
      perAction: {
        status: String,
        disableAt: Number,
        warnAt: Number,
      },
      uniquePerAction: {
        status: String,
        disableAt: Number,
        warnAt: Number,
      },
    },
    memberCreator: {
      id: String,
      activityBlocked: Boolean,
      avatarHash: String,
      avatarUrl: String,
      fullName: String,
      idMemberReferrer: String,
      initials: String,
      username: String,
    },
  },
});

const TrelloSnapshotsSchema = new Schema<ITrelloSnapshot>({
  actions: {
    type: [TrelloSnapshotAction],
    min: 1,
    required: true,
  },
  createdAt: Date,
});

const TrelloSnapshot = model<ITrelloSnapshot>(
  "trello-snapshots",
  TrelloSnapshotsSchema
);

export default TrelloSnapshot;
