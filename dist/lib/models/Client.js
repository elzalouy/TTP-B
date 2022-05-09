"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ClientSchema = new mongoose_1.Schema(
  {
    clientName: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: Object,
      default: {},
    },
    doneProject: { type: Number, default: 0 },
    inProgressProject: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: false,
  }
);
const Clients = (0, mongoose_1.model)("clients", ClientSchema);
exports.default = Clients;
