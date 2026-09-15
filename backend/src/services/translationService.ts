import crypto from 'crypto';
import TranslationCache from '../models/TranslationCache';

export const SUPPORTED_LANGUAGES = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'ur'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Standard terminology translations dictionary for fallback
const DICTIONARY_MAP: Record<string, Record<SupportedLanguage, string>> = {
    'plumbing repair': {
        en: 'Plumbing Repair',
        te: 'ప్లంబింగ్ మరమ్మత్తు',
        hi: 'प्लंबिंग मरम्मत',
        ta: 'பிளம்பிங் பழுது',
        kn: 'ಪ್ಲಂಬಿಂಗ್ ದುರಸ್ತಿ',
        ml: 'പ്ലംബിംഗ് റിപ്പയർ',
        mr: 'प्लंबिंग दुरुस्ती',
        bn: 'প্লাম্বিং মেরামত',
        ur: 'پلمبنگ کی مرمت',
    },
    'house wiring': {
        en: 'House Wiring & Electrical Installation',
        te: 'ఇంటి వైరింగ్ మరియు విద్యుత్ అమరిక',
        hi: 'घर की वायरिंग और बिजली स्थापना',
        ta: 'வீட்டு வயரிங் மற்றும் மின் நிறுவல்',
        kn: 'ಮನೆಯ ವೈರಿಂಗ್ ಮತ್ತು ವಿದ್ಯುತ್ ಅನುಸ್ಥಾಪನೆ',
        ml: 'വീടിന്റെ വയറിംഗും ഇലക്ട്രിക്കൽ ഇൻസ്റ്റാളേഷനും',
        mr: 'घर वायरिंग आणि इलेक्ट्रिकल इन्स्टॉलेशन',
        bn: 'হাউস ওয়্যারিং এবং ইলেকট্রিক্যাল ইনস্টলেশন',
        ur: 'گھر کی وائرنگ اور برقی تنصیب',
    },
    'daily wage': {
        en: 'Daily Wage Work',
        te: 'రోజువారీ వేతన పని',
        hi: 'दैनिक मजदूरी का काम',
        ta: 'தினசரி கூலி வேலை',
        kn: 'ದಿನಗೂಲಿ ಕೆಲಸ',
        ml: 'ദിനബത്ത ജോലി',
        mr: 'दैनिक मजुरीचे काम',
        bn: 'দৈনিক মজুরির কাজ',
        ur: 'روزانہ اجرت کا کام',
    },
    'urgent worker needed': {
        en: 'Urgent Worker Needed',
        te: 'అత్యవసరంగా కార్మికుడు అవసరం',
        hi: 'तत्काल कार्यकर्ता की आवश्यकता है',
        ta: 'அவசரமாக தொழிலாளி தேவை',
        kn: 'ತುರ್ತು ಕೆಲಸಗಾರ ಬೇಕಾಗಿದ್ದಾರೆ',
        ml: 'അടിയന്തിരമായി ജോലിക്കാരനെ ആവശ്യമുണ്ട്',
        mr: 'तातडीने कामगार हवा आहे',
        bn: 'জরুরী কর্মী প্রয়োজন',
        ur: 'فوری کارکن کی ضرورت ہے',
    },
};

/**
 * Generates SHA-256 hash of text & target language for cache lookup.
 */
const getHash = (text: string, targetLang: string): string => {
    return crypto.createHash('sha256').update(`${text.trim()}_${targetLang}`).digest('hex');
};

export const translateText = async (
    text: string,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'en',
    context: string = 'general'
): Promise<{ translatedText: string; cached: boolean; isAI: boolean }> => {
    if (!text || !text.trim()) {
        return { translatedText: '', cached: false, isAI: false };
    }

    const srcLang = (SUPPORTED_LANGUAGES.includes(sourceLanguage as any) ? sourceLanguage : 'en') as SupportedLanguage;
    const tgtLang = (SUPPORTED_LANGUAGES.includes(targetLanguage as any) ? targetLanguage : 'en') as SupportedLanguage;

    if (srcLang === tgtLang) {
        return { translatedText: text, cached: false, isAI: false };
    }

    const textHash = getHash(text, tgtLang);

    // 1. Check MongoDB Cache
    const cachedRecord = await TranslationCache.findOne({ textHash });
    if (cachedRecord) {
        return { translatedText: cachedRecord.translatedText, cached: true, isAI: true };
    }

    // 2. Check Fallback Dictionary
    const cleanKey = text.toLowerCase().trim();
    if (DICTIONARY_MAP[cleanKey] && DICTIONARY_MAP[cleanKey][tgtLang]) {
        const translated = DICTIONARY_MAP[cleanKey][tgtLang];
        await TranslationCache.create({
            textHash,
            sourceText: text,
            sourceLanguage: srcLang,
            targetLanguage: tgtLang,
            context,
            translatedText: translated,
        });
        return { translatedText: translated, cached: false, isAI: true };
    }

    // 3. Fallback AI Translator simulation (preserves numbers, currency ₹, & technical terms)
    let simulatedTranslation = text;
    if (tgtLang === 'te') {
        simulatedTranslation = `[తెలుగు అనువాదం] ${text}`;
    } else if (tgtLang === 'hi') {
        simulatedTranslation = `[हिंदी अनुवाद] ${text}`;
    } else if (tgtLang === 'ta') {
        simulatedTranslation = `[தமிழ் மொழிபெயர்ப்பு] ${text}`;
    } else if (tgtLang === 'kn') {
        simulatedTranslation = `[ಕನ್ನಡ ಅನುವಾದ] ${text}`;
    } else if (tgtLang === 'ml') {
        simulatedTranslation = `[മലയാളം വിവർത്തനം] ${text}`;
    } else if (tgtLang === 'mr') {
        simulatedTranslation = `[मराठी भाषांतर] ${text}`;
    } else if (tgtLang === 'bn') {
        simulatedTranslation = `[বাংলা অনুবাদ] ${text}`;
    } else if (tgtLang === 'ur') {
        simulatedTranslation = `[اردو ترجمہ] ${text}`;
    }

    // Save to Cache
    await TranslationCache.create({
        textHash,
        sourceText: text,
        sourceLanguage: srcLang,
        targetLanguage: tgtLang,
        context,
        translatedText: simulatedTranslation,
    });

    return { translatedText: simulatedTranslation, cached: false, isAI: true };
};
