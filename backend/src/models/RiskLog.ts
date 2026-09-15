import mongoose, { Document, Schema } from 'mongoose';

export interface IRiskLog extends Document {
    targetType: 'job' | 'user' | 'dispute' | 'payment';
    targetId: mongoose.Types.ObjectId | string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    riskScore: number;
    riskFlags: string[];
    explanation: string;
    requiresHumanReview: boolean;
    status: 'clear' | 'flagged' | 'under_review' | 'resolved';
    reviewedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const riskLogSchema: Schema = new Schema(
    {
        targetType: { type: String, enum: ['job', 'user', 'dispute', 'payment'], required: true },
        targetId: { type: Schema.Types.Mixed, required: true },
        riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
        riskScore: { type: Number, required: true, default: 0 },
        riskFlags: [{ type: String }],
        explanation: { type: String, required: true },
        requiresHumanReview: { type: Boolean, default: false },
        status: { type: String, enum: ['clear', 'flagged', 'under_review', 'resolved'], default: 'clear' },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default mongoose.model<IRiskLog>('RiskLog', riskLogSchema);
