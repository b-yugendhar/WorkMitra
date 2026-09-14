import mongoose, { Document, Schema } from 'mongoose';

export interface IVerificationRequest extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'identity' | 'skill_certificate' | 'work_video' | 'business_doc';
    fileUrl: string;
    status: 'pending' | 'approved' | 'rejected' | 'flagged_by_ai';
    extractedData: any;
    adminNotes?: string;
    reviewedBy?: mongoose.Types.ObjectId;
}

const verificationRequestSchema: Schema = new Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        type: {
            type: String,
            enum: ['identity', 'skill_certificate', 'work_video', 'business_doc'],
            required: true,
        },
        fileUrl: {
            type: String,
            required: true, // Typically points to S3 bucket
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected', 'flagged_by_ai'],
            default: 'pending',
        },
        extractedData: {
            type: Schema.Types.Mixed,
            default: {},
        },
        adminNotes: {
            type: String,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    },
    { timestamps: true }
);

const VerificationRequest = mongoose.model<IVerificationRequest>('VerificationRequest', verificationRequestSchema);
export default VerificationRequest;
