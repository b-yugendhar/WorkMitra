import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sparkles, HelpCircle, Loader2, X, Clock, CheckCircle2 } from 'lucide-react';

interface DisputeSummaryData {
    summary: string;
    timeline: string[];
    workerClaims: string[];
    employerClaims: string[];
    evidenceSummary: string[];
    missingInformation: string[];
    suggestedQuestions: string[];
    recommendation: string;
    createdAt: string;
}

interface AIDisputeSummaryModalProps {
    disputeId: string;
    onClose: () => void;
}

export const AIDisputeSummaryModal: React.FC<AIDisputeSummaryModalProps> = ({ disputeId, onClose }) => {
    const [data, setData] = useState<DisputeSummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (disputeId) fetchSummary();
    }, [disputeId]);

    const fetchSummary = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/ai/disputes/${disputeId}/summary`);
            setData(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load AI dispute summary.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-900 to-purple-900 p-5 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                            <Sparkles className="h-5 w-5 text-amber-300" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold">AI Dispute Case Summarizer</h3>
                            <p className="text-xs text-indigo-200">Automated Case Analysis & Verifier Guidance</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-800 flex-1">
                    {loading ? (
                        <div className="py-12 text-center space-y-2">
                            <Loader2 className="animate-spin h-8 w-8 text-indigo-600 mx-auto" />
                            <p className="text-xs text-gray-500 font-medium">Analyzing agreement terms, work updates, & submitted evidence...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs">
                            {error}
                        </div>
                    ) : data ? (
                        <>
                            {/* Summary callout */}
                            <div className="bg-indigo-50/80 p-4 rounded-xl border border-indigo-100 space-y-1">
                                <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block">Executive Summary</span>
                                <p className="text-sm font-medium text-indigo-950 leading-relaxed">{data.summary}</p>
                            </div>

                            {/* Timeline */}
                            <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-indigo-600" /> Contract & Incident Timeline
                                </h4>
                                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100 space-y-2">
                                    {data.timeline.map((event, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                                            <span className="text-gray-700 leading-snug">{event}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Claims & Evidence grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-100 space-y-1">
                                    <span className="font-bold text-amber-900 uppercase tracking-wider block text-[10px]">Worker Statement & Claims</span>
                                    {data.workerClaims.map((c, i) => (
                                        <p key={i} className="text-amber-950 text-xs">{c}</p>
                                    ))}
                                </div>

                                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-100 space-y-1">
                                    <span className="font-bold text-blue-900 uppercase tracking-wider block text-[10px]">Employer Statement & Counterclaims</span>
                                    {data.employerClaims.map((c, i) => (
                                        <p key={i} className="text-blue-950 text-xs">{c}</p>
                                    ))}
                                </div>
                            </div>

                            {/* Missing Info & Questions */}
                            <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2">
                                <h4 className="font-bold text-purple-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                                    <HelpCircle className="h-3.5 w-3.5 text-purple-600" /> Suggested Verifier Investigation Questions
                                </h4>
                                <ul className="space-y-1.5">
                                    {data.suggestedQuestions.map((q, i) => (
                                        <li key={i} className="flex items-start gap-2 text-purple-900">
                                            <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
                                            <span>{q}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-3 bg-gray-100 rounded-xl text-[11px] text-gray-500 font-medium text-center">
                                Human Oversight Notice: Final dispute resolution decisions remain under human admin verifier authority.
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
