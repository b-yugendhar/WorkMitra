import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IPayment extends Document {
    agreementId: Types.ObjectId;
    amount: number;
    currency: string;
    transactionId?: string; // e.g. stripe charge id
    status: 'pending' | 'successful' | 'failed' | 'refunded';
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema: Schema = new Schema(
    {
        agreementId: { type: Schema.Types.ObjectId, ref: 'WorkAgreement', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        transactionId: { type: String },
        status: {
            type: String,
            enum: ['pending', 'successful', 'failed', 'refunded'],
            default: 'pending'
        }
    },
    { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);
