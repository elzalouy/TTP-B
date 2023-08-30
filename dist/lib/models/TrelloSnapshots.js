"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TrelloSnapshotAction = new mongoose_1.Schema({
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
const TrelloSnapshotsSchema = new mongoose_1.Schema({
    actions: {
        type: [TrelloSnapshotAction],
        min: 1,
        required: true,
    },
    createdAt: Date,
});
const TrelloSnapshot = (0, mongoose_1.model)("trello-snapshots", TrelloSnapshotsSchema);
exports.default = TrelloSnapshot;
