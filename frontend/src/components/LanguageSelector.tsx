import React from 'react';
import { useLanguage, LanguageCode } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

const languageNames: Record<LanguageCode, string> = {
    en: 'English',
    te: 'తెలుగు (Telugu)',
    hi: 'हिन्दी (Hindi)',
    ta: 'தமிழ் (Tamil)',
    kn: 'ಕನ್ನಡ (Kannada)',
    ml: 'മലയാളം (Malayalam)',
    mr: 'मराठी (Marathi)',
    bn: 'বাংলা (Bengali)',
    ur: 'اردو (Urdu)',
};

export const LanguageSelector: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className={`flex items-center gap-1.5 ${className}`}>
            <Globe className="h-4 w-4 text-indigo-400 shrink-0" />
            <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
                {Object.entries(languageNames).map(([code, label]) => (
                    <option key={code} value={code}>
                        {label}
                    </option>
                ))}
            </select>
        </div>
    );
};
