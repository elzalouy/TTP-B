import { Document } from 'mongoose';

export interface Client extends Document {
  clientName: string;
  projectsId?: string[];
  image: string;
}

export interface ClientData {
  id?: string;
  clientName: string;
  projectsId?: string[];
  image?: string;
}
