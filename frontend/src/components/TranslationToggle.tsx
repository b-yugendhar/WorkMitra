import React, { useState } from 'react';
import api from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Globe, Loader2, Sparkles, RotateCcw } from 'lucide-react';

interface TranslationToggleProps {
    originalText: string;
    context?: string;
    className?: string;
}

export const TranslationToggle: React.FC<TranslationToggleProps> = ({ originalText, context = 'job_description', className = '' }) => {
    const { language } = useLanguage();
    const [translatedText, setTranslatedText] = useState<string | null>(null);
    const [isShowingTranslated, setIsShowingTranslated] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleTranslateToggle = async () => {
        if (isShowingTranslated) {
            setIsShowingTranslated(false);
            return;
        }

        if (translatedText) {
            setIsShowingTranslated(true);
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/ai/translate', {
                text: originalText,
                sourceLanguage: 'en',
                targetLanguage: language,
                context,
            });
            setTranslatedText(res.data.translatedText);
            setIsShowingTranslated(true);
        } catch (err) {
            console.error('Translation error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`space-y-1.5 ${className}`}>
            <div className="flex items-center justify-between gap-2">
                <button
                    onClick={handleTranslateToggle}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100"
                >
                    {loading ? (
                        <Loader2 className="animate-spin h-3.5 w-3.5" />
                    ) : isShowingTranslated ? (
                        <>
                            <RotateCcw className="h-3.5 w-3.5" /> View Original
                        </>
                    ) : (
                        <>
                            <Globe className="h-3.5 w-3.5" /> Translate with AI ({language.toUpperCase()})
                        </>
                    )}
                </button>

                {isShowingTranslated && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Sparkles className="h-2.5 w-2.5 text-amber-500" /> AI Translated
                    </span>
                )}
            </div>

            <div className="text-gray-700 leading-relaxed text-sm">
                {isShowingTranslated && translatedText ? translatedText : originalText}
            </div>
        </div>
    );
};
