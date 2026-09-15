import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IWorkAgreement extends Document {
    jobId: Types.ObjectId;
    applicationId?: Types.ObjectId;
    workerId: Types.ObjectId;
    employerId: Types.ObjectId;
    agreedWage: number;
    duration: string;
    startDate?: Date;
    endDate?: Date;
    terms: string;
    status: 'pending' | 'active' | 'completed' | 'cancelled' | 'disputed';
    paymentStatus?: 'pending' | 'escrow' | 'released';
    createdAt: Date;
    updatedAt: Date;
}

const workAgreementSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        applicationId: { type: Schema.Types.ObjectId, ref: 'Application' },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        agreedWage: { type: Number, required: true },
        duration: { type: String, required: true, default: '1 Day' },
        startDate: { type: Date },
        endDate: { type: Date },
        terms: { type: String, required: true },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'cancelled', 'disputed'],
            default: 'active',
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'escrow', 'released'],
            default: 'pending',
        },
    },
    { timestamps: true }
);

export default mongoose.model<IWorkAgreement>('WorkAgreement', workAgreementSchema);
