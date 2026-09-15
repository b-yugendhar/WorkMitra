import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Star, User, MessageSquare, Loader2, AlertCircle, PlusCircle } from 'lucide-react';

interface ReviewItem {
    _id: string;
    reviewerId: {
        _id: string;
        fullName: string;
    };
    revieweeId: {
        _id: string;
        fullName: string;
    };
    agreementId?: {
        jobId?: {
            title: string;
        };
    };
    rating: number;
    comment: string;
    createdAt: string;
}

export const EmployerReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [completedAgreements, setCompletedAgreements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // New Review Form State
    const [selectedAgreementId, setSelectedAgreementId] = useState<string>('');
    const [rating, setRating] = useState<number>(5);
    const [comment, setComment] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
        fetchCompletedAgreements();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/reviews/my');
            setReviews(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const fetchCompletedAgreements = async () => {
        try {
            const res = await api.get('/agreements/employer');
            const completed = res.data.filter((ag: any) => ag.status === 'completed');
            setCompletedAgreements(completed);
        } catch (err: any) {
            console.error('Error fetching completed contracts for review', err);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgreementId || !comment.trim()) {
            alert('Please select a completed contract and enter review feedback.');
            return;
        }

        const targetAgreement = completedAgreements.find((a) => a._id === selectedAgreementId);
        if (!targetAgreement) return;

        try {
            setSubmitting(true);
            await api.post('/reviews', {
                agreementId: targetAgreement._id,
                revieweeId: targetAgreement.workerId._id,
                rating,
                comment: comment.trim(),
            });

            alert('Review submitted successfully! Worker trust score updated.');
            setSelectedAgreementId('');
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-10 w-10 text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Worker Reviews & Ratings <Star className="h-6 w-6 text-amber-500 fill-amber-500" />
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Rate completed work contracts and build trust score on WorkMitra.
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-lg flex items-center gap-2 text-sm">
                    <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Leave Review Form */}
            {completedAgreements.length > 0 && (
                <form onSubmit={handleReviewSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                        <PlusCircle className="h-5 w-5 text-indigo-600" /> Submit Review for Completed Contract
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Select Completed Contract *</label>
                            <select
                                value={selectedAgreementId}
                                onChange={(e) => setSelectedAgreementId(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                                <option value="">-- Choose Contract --</option>
                                {completedAgreements.map((ag) => (
                                    <option key={ag._id} value={ag._id}>
                                        {ag.jobId?.title || 'Contract'} - Worker: {ag.workerId?.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">Rating (1 to 5 Stars) *</label>
                            <div className="flex items-center gap-2 pt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        type="button"
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="p-1 focus:outline-none"
                                    >
                                        <Star
                                            className={`h-6 w-6 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                                }`}
                                        />
                                    </button>
                                ))}
                                <span className="text-xs font-bold text-gray-700 ml-2">{rating} / 5 Stars</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">Review Comments *</label>
                        <textarea
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            required
                            placeholder="Share your experience working with this candidate (punctuality, quality of work, attitude)..."
                            className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1"
                        >
                            {submitting && <Loader2 className="animate-spin h-3.5 w-3.5" />}
                            Submit Review
                        </button>
                    </div>
                </form>
            )}

            {/* Past Reviews List */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">Reviews & Feedback History</h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-10">
                        <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">No reviews submitted or received yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((rev) => (
                            <div key={rev._id} className="p-4 rounded-lg border border-gray-100 bg-gray-50 space-y-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-indigo-600" />
                                        <span className="font-bold text-sm text-gray-900">
                                            {rev.revieweeId?.fullName || 'Worker'}
                                        </span>
                                        {rev.agreementId?.jobId?.title && (
                                            <span className="text-xs text-gray-500 font-normal">
                                                ({rev.agreementId.jobId.title})
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star
                                                key={s}
                                                className={`h-3.5 w-3.5 ${s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-xs text-gray-700 font-medium italic">"{rev.comment}"</p>

                                <span className="text-xs text-gray-400 block pt-1">
                                    {new Date(rev.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
