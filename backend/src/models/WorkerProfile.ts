import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    skills: string[];
    experienceSummary: string;
    location: {
        type: string;
        coordinates: number[];
    };
    availability: boolean;
    trustScore: number;
    totalJobsCompleted: number;
    verificationLevel: 'unverified' | 'basic' | 'advanced';
}

const workerProfileSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        skills: {
            type: [String],
            default: [],
        },
        experienceSummary: {
            type: String,
            default: '',
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: false,
            },
            coordinates: {
                type: [Number],
                required: false,
            },
        },
        availability: {
            type: Boolean,
            default: true,
        },
        trustScore: {
            type: Number,
            default: 0,
        },
        totalJobsCompleted: {
            type: Number,
            default: 0,
        },
        verificationLevel: {
            type: String,
            enum: ['unverified', 'basic', 'advanced'],
            default: 'unverified',
        },
    },
    { timestamps: true }
);

// Create geospatial index for location-based matching
workerProfileSchema.index({ location: '2dsphere' });

const WorkerProfile = mongoose.model<IWorkerProfile>('WorkerProfile', workerProfileSchema);
export default WorkerProfile;
