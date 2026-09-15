import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sparkles, CheckCircle2, AlertTriangle, Loader2, User, ChevronRight } from 'lucide-react';

interface ApplicantRanking {
    applicationId: string;
    worker: {
        _id: string;
        fullName: string;
        phone: string;
        email: string;
        preferredLanguage: string;
    };
    profile?: {
        skills: string[];
        trustScore: number;
        totalJobsCompleted: number;
        verificationLevel: string;
    };
    matchScore: number;
    strengths: string[];
    missingRequirements: string[];
    explanation: string;
    recommendation: 'top_match' | 'potential_match' | 'review';
    appliedAt: string;
}

interface EmployerApplicantRankingProps {
    jobId: string;
    onSelectApplicant?: (workerId: string) => void;
}

export const EmployerApplicantRanking: React.FC<EmployerApplicantRankingProps> = ({ jobId, onSelectApplicant }) => {
    const [rankings, setRankings] = useState<ApplicantRanking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (jobId) fetchRanking();
    }, [jobId]);

    const fetchRanking = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/ai/jobs/${jobId}/applicant-ranking`);
            setRankings(res.data.rankings || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load AI applicant ranking.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 space-y-2">
                <Loader2 className="animate-spin h-7 w-7 text-indigo-600 mx-auto" />
                <p className="text-xs text-gray-500 font-medium">Evaluating applicant skills, credentials, & trust scores...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center justify-between">
                <span>{error}</span>
                <button onClick={fetchRanking} className="underline font-bold">Retry</button>
            </div>
        );
    }

    if (rankings.length === 0) {
        return (
            <div className="p-6 bg-gray-50 border border-gray-100 rounded-xl text-center text-xs text-gray-500">
                No applicants to rank for this job yet.
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-indigo-600" /> AI Applicant Smart Ranking
                    </h3>
                    <p className="text-xs text-gray-500">Ranked by skill match, verified credentials, and trust scores. Select candidates manually below.</p>
                </div>
                <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                    {rankings.length} Applicants Evaluated
                </span>
            </div>

            <div className="space-y-3">
                {rankings.map((rank) => {
                    const badgeClass =
                        rank.recommendation === 'top_match'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : rank.recommendation === 'potential_match'
                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                : 'bg-amber-100 text-amber-800 border-amber-200';

                    const badgeText =
                        rank.recommendation === 'top_match'
                            ? '⭐ Top Match'
                            : rank.recommendation === 'potential_match'
                                ? '👍 Strong Candidate'
                                : '🔍 Review Required';

                    return (
                        <div key={rank.applicationId} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white transition-all space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                                        {rank.worker.fullName ? rank.worker.fullName.charAt(0) : <User className="h-5 w-5" />}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-900">{rank.worker.fullName}</h4>
                                        <p className="text-xs text-gray-500">{rank.worker.phone} • {rank.profile?.verificationLevel ? `Verified: ${rank.profile.verificationLevel}` : 'Standard Profile'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badgeClass}`}>
                                        {badgeText} ({rank.matchScore}%)
                                    </span>
                                </div>
                            </div>

                            {/* Strengths & Missing */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-100 space-y-1">
                                    <span className="font-bold text-emerald-900 block text-[11px] uppercase tracking-wider">Candidate Strengths</span>
                                    <ul className="space-y-0.5 text-emerald-800">
                                        {rank.strengths.map((st, i) => (
                                            <li key={i} className="flex items-center gap-1">
                                                <CheckCircle2 className="h-3 w-3 text-emerald-600 flex-shrink-0" /> {st}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {rank.missingRequirements.length > 0 && (
                                    <div className="bg-amber-50/70 p-2.5 rounded-lg border border-amber-100 space-y-1">
                                        <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider">Missing Job Skills</span>
                                        <ul className="space-y-0.5 text-amber-800">
                                            {rank.missingRequirements.map((ms, i) => (
                                                <li key={i} className="flex items-center gap-1">
                                                    <AlertTriangle className="h-3 w-3 text-amber-600 flex-shrink-0" /> {ms}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {onSelectApplicant && (
                                <div className="flex justify-end pt-1">
                                    <button
                                        onClick={() => onSelectApplicant(rank.worker._id)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                                    >
                                        Select & Proceed to Contract <ChevronRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
