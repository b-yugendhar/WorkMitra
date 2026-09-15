import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Sparkles, MapPin, IndianRupee, CheckCircle2, AlertCircle, Loader2, ArrowRight, RefreshCw, Briefcase, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface JobRecommendation {
    job: {
        _id: string;
        title: string;
        description: string;
        location: string;
        wage: number;
        duration: string;
        requiredSkills: string[];
        employerId?: {
            fullName: string;
            email: string;
            phone: string;
        };
    };
    matchScore: number;
    matchedSkills: string[];
    matchedLanguages: string[];
    reasons: string[];
    missingSkills: string[];
}

export const WorkerRecommendationsPage: React.FC = () => {
    const [recommendations, setRecommendations] = useState<JobRecommendation[]>([]);
    const [loading, setLoading] = useState(true);
    const [applyingId, setApplyingId] = useState<string | null>(null);
    const [appliedJobs, setAppliedJobs] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRecommendations();
    }, []);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/ai/recommendations/jobs');
            setRecommendations(res.data.recommendations || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load AI recommendations.');
        } finally {
            setLoading(false);
        }
    };

    const handleApply = async (jobId: string) => {
        try {
            setApplyingId(jobId);
            await api.post('/applications', { jobId });
            setAppliedJobs((prev) => ({ ...prev, [jobId]: true }));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit application.');
        } finally {
            setApplyingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
                <p className="text-sm font-medium text-gray-600">Analyzing your profile & skills for top job matches...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header banner */}
            <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/10">
                        <Sparkles className="h-3.5 w-3.5" /> AI Smart Job Matching Engine
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">AI Recommended Jobs for You</h1>
                    <p className="text-indigo-200 text-sm">
                        Jobs tailored specifically to your listed skills, location preference, expected wage, and verified work credentials.
                    </p>
                </div>
                <button
                    onClick={fetchRecommendations}
                    className="absolute top-6 right-6 p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white flex items-center gap-2 text-xs font-medium backdrop-blur-sm"
                >
                    <RefreshCw className="h-4 w-4" /> Refresh Matches
                </button>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-800 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
                    <span>{error}</span>
                    <button onClick={fetchRecommendations} className="ml-auto text-xs underline font-semibold">Try Again</button>
                </div>
            )}

            {recommendations.length === 0 && !error ? (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-4 shadow-sm">
                    <Briefcase className="h-12 w-12 text-indigo-400 mx-auto" />
                    <h3 className="text-lg font-bold text-gray-900">No New Recommendations Found</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Make sure your profile skills, location, and daily wage expectations are fully completed to get personalized AI matches.
                    </p>
                    <button
                        onClick={() => navigate('/worker/profile')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-xl transition-colors shadow-sm inline-flex items-center gap-2"
                    >
                        Update Profile Skills
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.map(({ job, matchScore, matchedSkills, reasons }) => {
                        const isApplied = appliedJobs[job._id];
                        const scoreColor =
                            matchScore >= 85 ? 'bg-emerald-500 text-white' : matchScore >= 65 ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white';

                        return (
                            <div
                                key={job._id}
                                className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative"
                            >
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                                                {job.duration || 'Daily Wage'}
                                            </span>
                                            <h3 className="text-lg font-bold text-gray-900 leading-snug">{job.title}</h3>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 ${scoreColor}`}>
                                            <Sparkles className="h-3 w-3" /> {matchScore}% Match
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-600">
                                        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                                            <IndianRupee className="h-3.5 w-3.5" />
                                            <span>₹{job.wage} / day</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-700 bg-gray-50 px-2.5 py-1 rounded-md">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                                            <span>{job.location}</span>
                                        </div>
                                    </div>

                                    {/* AI Match Reasons */}
                                    <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100/50 space-y-1.5">
                                        <p className="text-[11px] font-bold text-indigo-900 flex items-center gap-1 uppercase tracking-wider">
                                            <Award className="h-3 w-3 text-indigo-600" /> Why AI Recommends This:
                                        </p>
                                        <ul className="space-y-1">
                                            {reasons.map((reason, idx) => (
                                                <li key={idx} className="text-xs text-indigo-950 flex items-start gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                                    <span>{reason}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Skills Breakdown */}
                                    <div className="space-y-1.5 pt-1">
                                        <div className="flex flex-wrap gap-1.5">
                                            {job.requiredSkills?.map((skill, idx) => {
                                                const isMatched = matchedSkills.includes(skill);
                                                return (
                                                    <span
                                                        key={idx}
                                                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${isMatched ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-600'
                                                            }`}
                                                    >
                                                        {isMatched ? '✓ ' : ''}{skill}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                    <button
                                        onClick={() => navigate(`/jobs/${job._id}`)}
                                        className="text-xs font-semibold text-gray-600 hover:text-indigo-600 transition-colors"
                                    >
                                        View Job Details
                                    </button>

                                    <button
                                        onClick={() => handleApply(job._id)}
                                        disabled={isApplied || applyingId === job._id}
                                        className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${isApplied
                                            ? 'bg-emerald-100 text-emerald-800 cursor-default'
                                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                            }`}
                                    >
                                        {applyingId === job._id ? (
                                            <Loader2 className="animate-spin h-3.5 w-3.5" />
                                        ) : isApplied ? (
                                            <>
                                                <CheckCircle2 className="h-3.5 w-3.5" /> Applied
                                            </>
                                        ) : (
                                            <>
                                                Apply Now <ArrowRight className="h-3.5 w-3.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
