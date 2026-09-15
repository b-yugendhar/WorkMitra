import mongoose, { Document, Schema } from 'mongoose';

export interface IAIAuditLog extends Document {
    userId?: mongoose.Types.ObjectId;
    featureName: string;
    relatedEntityId?: string;
    status: 'success' | 'failed' | 'fallback';
    modelProvider: string;
    processingDurationMs: number;
    requiresHumanReview: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const aiAuditLogSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        featureName: { type: String, required: true },
        relatedEntityId: { type: String },
        status: { type: String, enum: ['success', 'failed', 'fallback'], default: 'success' },
        modelProvider: { type: String, default: 'WorkMitra-AI-Engine' },
        processingDurationMs: { type: Number, default: 0 },
        requiresHumanReview: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

export default mongoose.model<IAIAuditLog>('AIAuditLog', aiAuditLogSchema);
