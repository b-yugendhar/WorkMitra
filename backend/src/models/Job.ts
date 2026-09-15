import mongoose, { Document, Schema } from 'mongoose';

export interface IJob extends Document {
    employerId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    requiredSkills: string[];
    location: string;
    coordinates?: {
        type: 'Point';
        coordinates: [number, number]; // [longitude, latitude]
    };
    wage: number;
    duration: string;
    status: 'open' | 'closed' | 'in_progress';
    createdAt: Date;
    updatedAt: Date;
}

const jobSchema: Schema = new Schema(
    {
        employerId: {
            type: mongoose.Schema.Types.ObjectId,
            required: [true, 'Employer ID is required'],
            ref: 'User',
        },
        title: {
            type: String,
            required: [true, 'Job title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Job description is required'],
            trim: true,
        },
        requiredSkills: {
            type: [String],
            required: [true, 'At least one required skill must be specified'],
            default: [],
        },
        location: {
            type: String,
            required: [true, 'Job location is required'],
            trim: true,
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point',
            },
            coordinates: {
                type: [Number],
                default: undefined,
            },
        },
        wage: {
            type: Number,
            required: [true, 'Wage is required'],
            min: [0, 'Wage must be a positive number'],
        },
        duration: {
            type: String,
            required: [true, 'Job duration is required'],
            trim: true,
        },
        status: {
            type: String,
            enum: ['open', 'closed', 'in_progress'],
            default: 'open',
        },
    },
    { timestamps: true }
);

jobSchema.index({ employerId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ title: 'text', description: 'text', location: 'text', requiredSkills: 'text' });

const Job = mongoose.model<IJob>('Job', jobSchema);
export default Job;
