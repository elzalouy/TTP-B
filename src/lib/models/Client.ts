import { Client } from './../types/model/Client';
import { model, Schema, Model } from 'mongoose';

const ClientSchema: Schema = new Schema<Client>(
  {
    clientName: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      default: '',
    },
    projectsId: [{ type: Schema.Types.ObjectId, ref: 'projects' }],
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Clients: Model<Client> = model('clients', ClientSchema);

export default Clients;
