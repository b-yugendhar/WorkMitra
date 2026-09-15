import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IDispute extends Document {
    agreementId: Types.ObjectId;
    raisedBy: Types.ObjectId;
    againstUser: Types.ObjectId;
    reason: string;
    description: string;
    evidence: string[];
    status: 'open' | 'under_review' | 'resolved' | 'rejected';
    adminNotes?: string;
    resolutionDetails?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const disputeSchema: Schema = new Schema(
    {
        agreementId: { type: Schema.Types.ObjectId, ref: 'WorkAgreement', required: true },
        raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        againstUser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        reason: { type: String, required: true },
        description: { type: String, required: true },
        evidence: [{ type: String }],
        status: {
            type: String,
            enum: ['open', 'under_review', 'resolved', 'rejected'],
            default: 'open',
        },
        adminNotes: { type: String, default: '' },
        resolutionDetails: { type: String, default: '' },
        resolvedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IDispute>('Dispute', disputeSchema);
