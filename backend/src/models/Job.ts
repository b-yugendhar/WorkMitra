import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    employerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requiredSkills: string[];
    location: {
        type: string;
        coordinates: number[];
    };
    jobType: 'full-time' | 'part-time' | 'contract' | 'one-off';
    budget: {
        min: number;
        max: number;
        currency: string;
    };
    status: 'open' | 'filled' | 'closed' | 'draft';
}

const jobSchema: Schema = new Schema(
    {
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        requiredSkills: {
            type: [String],
            default: [],
        },
        location: {
            type: {
                type: String,
                enum: ['Point'],
                required: true,
            },
            coordinates: {
                type: [Number],
                required: true,
            },
        },
        jobType: {
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'one-off'],
            required: true,
        },
        budget: {
            min: { type: Number },
            max: { type: Number },
            currency: { type: String, default: 'INR' },
        },
        status: {
            type: String,
            enum: ['open', 'filled', 'closed', 'draft'],
            default: 'draft',
        },
    },
    { timestamps: true }
);

jobSchema.index({ location: '2dsphere' });
jobSchema.index({ employerId: 1 });
jobSchema.index({ status: 1 });

const Job = mongoose.model<IJob>('Job', jobSchema);
export default Job;
