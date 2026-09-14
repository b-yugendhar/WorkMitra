import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorkAgreement extends Document {
    jobId: Types.ObjectId;
    workerId: Types.ObjectId;
    employerId: Types.ObjectId;
    terms: string;
    agreedAmount: number;
    status: 'active' | 'completed' | 'disputed';
    paymentStatus: 'pending' | 'escrow' | 'released';
    createdAt: Date;
    updatedAt: Date;
}

const workAgreementSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        terms: { type: String, required: true },
        agreedAmount: { type: Number, required: true },
        status: {
            type: String,
            enum: ['active', 'completed', 'disputed'],
            default: 'active'
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'escrow', 'released'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export default mongoose.model<IWorkAgreement>('WorkAgreement', workAgreementSchema);
