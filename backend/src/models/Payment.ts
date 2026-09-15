import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
    agreementId: Types.ObjectId;
    workerId: Types.ObjectId;
    employerId: Types.ObjectId;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed' | 'refunded';
    paymentReference: string;
    paidAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema: Schema = new Schema(
    {
        agreementId: { type: Schema.Types.ObjectId, ref: 'WorkAgreement', required: true },
        workerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        employerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentReference: { type: String, required: true },
        paidAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
