import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
    jobId: Types.ObjectId;
    reviewerId: Types.ObjectId; // User giving the review
    revieweeId: Types.ObjectId; // User receiving the review
    rating: number; // 1 to 5
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema: Schema = new Schema(
    {
        jobId: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
        reviewerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        revieweeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model<IReview>('Review', reviewSchema);
