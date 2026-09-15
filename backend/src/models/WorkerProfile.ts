import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    skills: string[];
    experienceSummary: string;
    locationText?: string;
    location?: {
        type: string;
        coordinates: number[];
    };
    expectedWage?: number;
    workType?: 'full-time' | 'part-time' | 'daily-wage' | 'contract';
    preferredLanguage?: string;
    additionalLanguages?: string[];
    availabilityStatus?: 'available' | 'busy' | 'not-available';
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
            unique: true,
        },
        skills: {
            type: [String],
            default: [],
        },
        experienceSummary: {
            type: String,
            default: '',
        },
        locationText: {
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
        expectedWage: {
            type: Number,
            default: 0,
        },
        workType: {
            type: String,
            enum: ['full-time', 'part-time', 'daily-wage', 'contract'],
            default: 'daily-wage',
        },
        preferredLanguage: {
            type: String,
            default: 'English',
        },
        additionalLanguages: {
            type: [String],
            default: [],
        },
        availabilityStatus: {
            type: String,
            enum: ['available', 'busy', 'not-available'],
            default: 'available',
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

workerProfileSchema.index({ skills: 1 });
workerProfileSchema.index({ locationText: 'text' });

const WorkerProfile = mongoose.model<IWorkerProfile>('WorkerProfile', workerProfileSchema);
export default WorkerProfile;
