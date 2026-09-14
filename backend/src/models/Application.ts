import mongoose, { Document, Schema } from 'mongoose';

export interface IApplication extends Document {
    jobId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    status: 'applied' | 'reviewed' | 'shortlisted' | 'hired' | 'rejected';
    matchScore: number;
    coverNote?: string;
    appliedAt: Date;
}

const applicationSchema: Schema = new Schema(
    {
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Job',
        },
        workerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        status: {
            type: String,
            enum: ['applied', 'reviewed', 'shortlisted', 'hired', 'rejected'],
            default: 'applied',
        },
        matchScore: {
            type: Number,
            required: false,
            min: 0,
            max: 100,
        },
        coverNote: {
            type: String,
            required: false,
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Prevent duplicate applications for the same job by the same worker
applicationSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

const Application = mongoose.model<IApplication>('Application', applicationSchema);
export default Application;
