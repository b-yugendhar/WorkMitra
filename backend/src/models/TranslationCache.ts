import mongoose, { Document, Schema } from 'mongoose';

export interface ITranslationCache extends Document {
    textHash: string;
    sourceText: string;
    sourceLanguage: string;
    targetLanguage: string;
    context?: string;
    translatedText: string;
    createdAt: Date;
}

const translationCacheSchema: Schema = new Schema(
    {
        textHash: { type: String, required: true, index: true },
        sourceText: { type: String, required: true },
        sourceLanguage: { type: String, required: true, default: 'en' },
        targetLanguage: { type: String, required: true },
        context: { type: String, default: 'general' },
        translatedText: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ITranslationCache>('TranslationCache', translationCacheSchema);
