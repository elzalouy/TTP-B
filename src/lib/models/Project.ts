import { ProjectInfo } from './../types/model/Project';
import { model, Schema, Model } from 'mongoose';

const ProjectSchema: Schema = new Schema<ProjectInfo>(
  {
    name: {
      type: String,
      required: true,
    },
    projectManager: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    teamsId: [
      {
        type: Schema.Types.ObjectId,
        ref: 'teams',
      },
    ],
    numberOfTasks: {
      type: Number,
      default: 0,
    },
    numberOfFinshedTasks: {
      type: Number,
      default: 0,
    },
    projectDeadline: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: Date.now(),
    },
    completedDate: {
      type: Date,
      default: null,
    },
    projectStatus: {
      type: String,
      default: 'inProgress',
      enum: [
        'inProgress',
        'deliver on time',
        'late',
        'deliver defore deadline',
        'delivered after deadline',
      ],
    },
  },
  {
    timestamps: true,
    strict: false,
  }
);

const Project: Model<ProjectInfo> = model('projects', ProjectSchema);

export default Project;
