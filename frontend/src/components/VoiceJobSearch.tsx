import React, { useState } from 'react';
import api from '../services/api';
import { Mic, MicOff, Loader2, Sparkles } from 'lucide-react';

interface VoiceJobSearchProps {
    onFiltersParsed: (filters: { skill?: string; location?: string; minWage?: number; keyword?: string }) => void;
}

export const VoiceJobSearch: React.FC<VoiceJobSearchProps> = ({ onFiltersParsed }) => {
    const [listening, setListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [processing, setProcessing] = useState(false);

    const startListening = () => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            alert('Voice search is not supported in your browser. Please type your search keyword.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setListening(true);
            setTranscript('Listening for voice command...');
        };

        recognition.onresult = async (event: any) => {
            const spokenText = event.results[0][0].transcript;
            setTranscript(`"${spokenText}"`);
            setListening(false);
            setProcessing(true);

            try {
                const res = await api.post('/ai/voice-parse', { rawText: spokenText });
                if (res.data.filters) {
                    onFiltersParsed(res.data.filters);
                }
            } catch (err) {
                console.error('Failed to parse voice command:', err);
            } finally {
                setProcessing(false);
            }
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setListening(false);
            setTranscript('Could not capture audio. Please try again.');
        };

        recognition.onend = () => {
            setListening(false);
        };

        recognition.start();
    };

    return (
        <div className="relative inline-flex items-center gap-2">
            <button
                type="button"
                onClick={startListening}
                disabled={listening || processing}
                className={`p-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold ${listening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80'
                    }`}
                title="Search jobs using Voice command (e.g. Electrician jobs in Hyderabad over 700)"
            >
                {processing ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                ) : listening ? (
                    <MicOff className="h-4 w-4" />
                ) : (
                    <Mic className="h-4 w-4 text-indigo-600" />
                )}
                <span className="hidden sm:inline">
                    {listening ? 'Listening...' : processing ? 'Parsing AI...' : 'Voice Search'}
                </span>
            </button>

            {transcript && (
                <div className="absolute top-12 left-0 z-30 bg-gray-900 text-white text-[11px] px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap flex items-center gap-1.5 animate-in fade-in">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    <span>{transcript}</span>
                </div>
            )}
        </div>
    );
};
