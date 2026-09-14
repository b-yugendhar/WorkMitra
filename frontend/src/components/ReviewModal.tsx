import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment: string) => void;
    revieweeName: string;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, onSubmit, revieweeName }) => {
    const [rating, setRating] = useState(0);
    const [currentHover, setCurrentHover] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-8 text-center border-b border-slate-100">
                        <h3 className="text-2xl font-bold text-slate-800 mb-2">Rate {revieweeName}</h3>
                        <p className="text-slate-500">How was your experience working together?</p>
                    </div>

                    <div className="p-8">
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    onMouseEnter={() => setCurrentHover(star)}
                                    onMouseLeave={() => setCurrentHover(0)}
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-10 h-10 transition-colors duration-200 ${(currentHover || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`}
                                    />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience (optional)..."
                            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none h-32 transition-all"
                        ></textarea>

                        <button
                            onClick={() => onSubmit(rating, comment)}
                            disabled={rating === 0}
                            className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all ${rating > 0
                                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/30'
                                    : 'bg-slate-300 cursor-not-allowed'
                                }`}
                        >
                            Submit Review
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
