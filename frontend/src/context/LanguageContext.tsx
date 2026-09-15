import React, { createContext, useContext, useState } from 'react';
import api from '../services/api';

export type LanguageCode = 'en' | 'te' | 'hi' | 'ta' | 'kn' | 'ml' | 'mr' | 'bn' | 'ur';

interface LanguageContextType {
    language: LanguageCode;
    setLanguage: (lang: LanguageCode) => void;
    t: (key: string) => string;
}

const translations: Record<string, Record<string, string>> = {
    en: {
        dashboard: 'Dashboard',
        jobs: 'Available Jobs',
        myWork: 'My Work',
        applications: 'My Applications',
        agreements: 'Work Contracts',
        payments: 'Payments & Payouts',
        reviews: 'Ratings & Reviews',
        disputes: 'Dispute Management',
        profile: 'Profile',
        settings: 'Settings',
        logout: 'Sign Out',
        search: 'Search Jobs...',
        filter: 'Filter',
        location: 'Location',
        skill: 'Skill',
        wage: 'Wage',
        apply: 'Apply Now',
        status: 'Status',
        actions: 'Actions',
        save: 'Save Changes',
        cancel: 'Cancel',
        loading: 'Loading...',
        language: 'Language',
        pending: 'Pending',
        active: 'Active',
        completed: 'Completed',
        rejected: 'Rejected',
        disputed: 'Disputed',
    },
    te: {
        dashboard: 'డాష్‌బోర్డ్',
        jobs: 'అందుబాటులో ఉన్న ఉద్యోగాలు',
        myWork: 'నా పని',
        applications: 'నా దరఖాస్తులు',
        agreements: 'పని ఒప్పందాలు',
        payments: 'చెల్లింపులు',
        reviews: 'రేటింగ్‌లు మరియు సమీక్షలు',
        disputes: 'ఫర్యాదుల నిర్వహణ',
        profile: 'ప్రొఫైల్',
        settings: 'సెట్టింగ్‌లు',
        logout: 'లాగ్ అవుట్',
        search: 'ఉద్యోగాలను వెతకండి...',
        filter: 'ఫిల్టర్',
        location: 'ప్రాంతం',
        skill: 'నైపుణ్యం',
        wage: 'వేతనం',
        apply: 'ఇప్పుడే దరఖాస్తు చేయండి',
        status: 'స్థితి',
        actions: 'చర్యలు',
        save: 'మార్పులను సేవ్ చేయండి',
        cancel: 'రద్దు చేయి',
        loading: 'లోడ్ అవుతోంది...',
        language: 'భాష',
        pending: 'పెండింగ్',
        active: 'యాక్టివ్',
        completed: 'పూర్తయింది',
        rejected: 'తిరస్కరించబడింది',
        disputed: 'వివాదాస్పదం',
    },
    hi: {
        dashboard: 'डैशबोर्ड',
        jobs: 'उपलब्ध नौकरियां',
        myWork: 'मेरा कार्य',
        applications: 'मेरे आवेदन',
        agreements: 'कार्य अनुबंध',
        payments: 'भुगतान',
        reviews: 'रेटिंग और समीक्षाएं',
        disputes: 'विवाद प्रबंधन',
        profile: 'प्रोफ़ाइल',
        settings: 'सेटिंग्स',
        logout: 'साइन आउट',
        search: 'नौकरियां खोजें...',
        filter: 'फ़िल्टर',
        location: 'स्थान',
        skill: 'कौशल',
        wage: 'मज़दूरी',
        apply: 'अभी आवेदन करें',
        status: 'स्थिति',
        actions: 'कार्रवाई',
        save: 'बदलाव सहेजें',
        cancel: 'रद्द करें',
        loading: 'लोड हो रहा है...',
        language: 'भाषा',
        pending: 'लंबित',
        active: 'सक्रिय',
        completed: 'पूरा हुआ',
        rejected: 'अस्वीकृत',
        disputed: 'विवादित',
    },
};

const LanguageContext = createContext<LanguageContextType>({
    language: 'en',
    setLanguage: () => { },
    t: (key) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<LanguageCode>(() => {
        const saved = localStorage.getItem('workmitra_lang') as LanguageCode;
        return saved || 'en';
    });

    const setLanguage = async (newLang: LanguageCode) => {
        setLanguageState(newLang);
        localStorage.setItem('workmitra_lang', newLang);

        // Optionally update profile in background if logged in
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await api.put('/users/profile', { preferredLanguage: newLang });
            }
        } catch (err) {
            // Ignore background sync errors
        }
    };

    const t = (key: string): string => {
        const langDict = translations[language] || translations['en'];
        return langDict[key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
