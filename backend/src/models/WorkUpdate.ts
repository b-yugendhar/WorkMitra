import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorkUpdate extends Document {
    agreementId: Types.ObjectId;
    workerId: Types.ObjectId;
    employerId: Types.ObjectId;
    message: string;
    progress: number;
    proofFiles: string[];
    employerApproval: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const workUpdateSchema: Schema = new Schema(
    {
        agreementId: { type: Schema.Types.ObjectId, ref: 'WorkAgreement', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        progress: { type: Number, required: true, min: 0, max: 100 },
        proofFiles: [{ type: String }],
        employerApproval: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IWorkUpdate>('WorkUpdate', workUpdateSchema);
