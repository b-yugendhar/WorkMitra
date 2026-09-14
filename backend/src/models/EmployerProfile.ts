import mongoose, { Document, Schema } from 'mongoose';

export interface IEmployerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    companyName: string;
    industry: string;
    location: string;
    verificationStatus: 'pending' | 'verified';
}

const employerProfileSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        companyName: {
            type: String,
            required: true,
        },
        industry: {
            type: String,
            required: true,
        },
        location: {
            type: String,
            required: false,
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
