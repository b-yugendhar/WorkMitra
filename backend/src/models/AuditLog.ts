import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IAuditLog extends Document {
    adminId: Types.ObjectId;
    actionType: string;
    details: string;
    targetId?: Types.ObjectId; // E.g., user id or agreement id
    createdAt: Date;
}

const auditLogSchema: Schema = new Schema(
    {
        adminId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        actionType: { type: String, required: true },
        details: { type: String, required: true },
        targetId: { type: Schema.Types.ObjectId }
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IAuditLog>('AuditLog', auditLogSchema);
