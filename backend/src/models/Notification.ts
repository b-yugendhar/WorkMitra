import mongoose, { Document, Schema, Types } from 'mongoose';

export interface INotification extends Document {
    userId: Types.ObjectId;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    readStatus: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema: Schema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ['info', 'success', 'warning', 'error'],
            default: 'info'
        },
        readStatus: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
