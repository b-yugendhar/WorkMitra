import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Star, MessageSquare, User, Loader2, AlertCircle, Award } from 'lucide-react';

interface ReviewItem {
    _id: string;
    reviewerId?: {
        fullName: string;
        phone: string;
        role: string;
    };
    revieweeId?: {
        fullName: string;
        phone: string;
        role: string;
    };
    jobId?: {
        title: string;
    };
    rating: number;
    comment?: string;
    createdAt: string;
}

export const WorkerReviewsPage: React.FC = () => {
    const [received, setReceived] = useState<ReviewItem[]>([]);
    const [given, setGiven] = useState<ReviewItem[]>([]);
    const [activeTab, setActiveTab] = useState<'received' | 'given'>('received');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/reviews/my');
            setReceived(res.data.receivedReviews || []);
            setGiven(res.data.givenReviews || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    const avgRating =
        received.length > 0
            ? (received.reduce((sum, r) => sum + r.rating, 0) / received.length).toFixed(1)
            : 'N/A';

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Ratings & Feedback <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Build your trust score by earning positive feedback from employers
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl">
                    <Award className="h-6 w-6 text-amber-600" />
                    <div>
                        <span className="text-xs font-bold text-amber-800 uppercase block">Average Score</span>
                        <span className="text-xl font-black text-amber-700 flex items-center gap-1">
                            {avgRating} <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 gap-4">
                <button
                    onClick={() => setActiveTab('received')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'received'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Reviews Received ({received.length})
                </button>
                <button
                    onClick={() => setActiveTab('given')}
                    className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'given'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Reviews Given ({given.length})
                </button>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {activeTab === 'received' ? (
                    received.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                            <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500">No reviews received yet. Complete jobs to build feedback.</p>
                        </div>
                    ) : (
                        received.map((rev) => (
                            <div key={rev._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-600" />
                                        <span className="font-bold text-sm text-gray-900">
                                            {rev.reviewerId?.fullName || 'Employer'} ({rev.reviewerId?.role})
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 border border-amber-200">
                                        {rev.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    </div>
                                </div>

                                {rev.jobId?.title && (
                                    <p className="text-xs font-semibold text-gray-500">Job: {rev.jobId.title}</p>
                                )}

                                {rev.comment && (
                                    <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 italic">
                                        "{rev.comment}"
                                    </p>
                                )}

                                <p className="text-[11px] text-gray-400 text-right">
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        ))
                    )
                ) : given.length === 0 ? (
                    <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">You haven't submitted any reviews for employers yet.</p>
                    </div>
                ) : (
                    given.map((rev) => (
                        <div key={rev._id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4 text-indigo-600" />
                                    <span className="font-bold text-sm text-gray-900">
                                        To: {rev.revieweeId?.fullName || 'Employer'} ({rev.revieweeId?.role})
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-bold text-amber-700 border border-amber-200">
                                    {rev.rating} <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                </div>
                            </div>

                            {rev.comment && (
                                <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-100 italic">
                                    "{rev.comment}"
                                </p>
                            )}

                            <p className="text-[11px] text-gray-400 text-right">
                                {new Date(rev.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};
