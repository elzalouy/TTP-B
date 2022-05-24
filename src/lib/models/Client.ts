import { Client } from "./../types/model/Client";
import { model, Schema, Model } from "mongoose";

const ClientSchema: Schema = new Schema<Client>(
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
    // createdAt, updatedAt properties
    timestamps: true,
    // it allow other data that were not in specified in our schema to be save or not.
    strict: false,
  }
);

const Clients: Model<Client> = model("clients", ClientSchema);

export default Clients;
