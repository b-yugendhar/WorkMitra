import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    companyName: string;
    industry: string;
    location?: string;
    description?: string;
    preferredLanguage?: string;
    verificationStatus: 'pending' | 'verified';
    createdAt: Date;
    updatedAt: Date;
}

const employerProfileSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
            unique: true,
        },
        companyName: {
            type: String,
            required: true,
            default: 'Independent Employer',
        },
        industry: {
            type: String,
            required: true,
            default: 'General',
        },
        location: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        preferredLanguage: {
            type: String,
            default: 'English',
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

const EmployerProfile = mongoose.model<IEmployerProfile>('EmployerProfile', employerProfileSchema);
export default EmployerProfile;
