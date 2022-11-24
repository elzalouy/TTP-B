"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema({
    clientName: {
        type: String,
        required: true,
    },
    image: {
        type: Object,
        default: {},
    },
    doneProject: { type: Number, default: 0 },
    In ProgressProject: { type: Number, default: 0 },
}, {
    // createdAt, updatedAt properties
    timestamps: true,
    // it allow other data that were not in specified in our schema to be save or not.
    strict: false,
});
const Clients = (0, mongoose_1.model)("clients", ClientSchema);
exports.default = Clients;
