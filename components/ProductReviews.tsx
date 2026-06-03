import React, { useState, useEffect, useMemo } from 'react';
import { StarIcon } from './icons/StarIcon';
import { Review } from '../types';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { XMarkIcon } from './icons/XMarkIcon';

interface ProductReviewsProps {
    productId: string;
}

const RatingBar: React.FC<{ stars: number; count: number; total: number }> = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
        <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center w-8">
                <span className="font-bold text-gray-700">{stars}</span>
                <StarIcon className="w-4 h-4 text-amber-400 ml-1" />
            </div>
            <div className="flex-grow h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-amber-400 rounded-full" 
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
            <span className="text-xs text-gray-500 w-10 text-right">{count}</span>
        </div>
    );
};

const ReviewModal: React.FC<{ onClose: () => void; onSubmit: (rating: number, comment: string) => void }> = ({ onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, comment);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>
                <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6 text-center">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tap to Rate</label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button 
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className="focus:outline-none transition-transform active:scale-90 hover:scale-110"
                                >
                                    <StarIcon className={`w-10 h-10 ${rating >= star ? 'text-amber-400' : 'text-gray-200'}`} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 min-h-[100px]"
                            placeholder="Tell us what you liked or didn't like..."
                            required
                        />
                    </div>
                    <button type="submit" className="w-full bg-amber-600 text-white font-bold py-3 rounded-lg hover:bg-amber-700 transition-colors shadow-md">
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId }) => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await api.getProductReviews(productId);
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const handleAddReview = async (rating: number, comment: string) => {
        if (!user) return;
        
        try {
            const newReview: Omit<Review, 'id'> = {
                productId,
                userId: user.id,
                userName: user.name,
                userPhoto: user.photoURL || undefined,
                rating,
                comment,
                date: new Date().toISOString()
            };
            
            await api.addReview(newReview);
            await fetchReviews();
            setIsModalOpen(false);
            addNotification("Review submitted successfully!", "success");
        } catch (error: any) {
            console.error("Failed to submit review", error);
            let message = "Failed to submit review.";
            if (error.code === 'permission-denied') {
                message = "Permission Denied. Please ensure Firestore rules for 'reviews' collection are deployed correctly.";
            } else if (error.message) {
                message = `Error: ${error.message}`;
            }
            addNotification(message, "error");
        }
    };

    const stats = useMemo(() => {
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        const average = total > 0 ? (sum / total).toFixed(1) : "0.0";
        
        const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            const rounded = Math.round(r.rating);
            if (rounded >= 1 && rounded <= 5) {
                counts[rounded as keyof typeof counts]++;
            }
        });

        return { total, average, counts };
    }, [reviews]);

    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Ratings & Reviews</h2>
                
                <div className="flex flex-col md:flex-row gap-8 mb-8">
                    {/* Left: Summary */}
                    <div className="md:w-1/3 flex flex-col items-center justify-center text-center p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="text-5xl font-extrabold text-gray-900 mb-1">{stats.average}</div>
                        <div className="flex mb-2">
                            {[1, 2, 3, 4, 5].map(star => (
                                <StarIcon key={star} className={`w-5 h-5 ${parseFloat(stats.average) >= star ? 'text-amber-400' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <p className="text-sm text-gray-500 font-medium">{stats.total} Ratings</p>
                    </div>

                    {/* Middle: Bars */}
                    <div className="md:w-2/3 space-y-2 flex flex-col justify-center">
                        {[5, 4, 3, 2, 1].map(star => (
                            <RatingBar key={star} stars={star} count={stats.counts[star as keyof typeof stats.counts]} total={stats.total} />
                        ))}
                    </div>
                </div>

                <div className="border-b border-gray-200 pb-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Review this product</h3>
                    <p className="text-gray-600 text-sm mb-4">Share your thoughts with other customers</p>
                    <button 
                        onClick={() => {
                            if (user) setIsModalOpen(true);
                            else {
                                addNotification("Please log in to write a review", "info");
                            }
                        }}
                        className="w-full md:w-auto px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                    >
                        Write a Customer Review
                    </button>
                </div>

                <div className="space-y-6">
                    {loading ? (
                        <p className="text-gray-500 text-center py-4">Loading reviews...</p>
                    ) : reviews.length > 0 ? (
                        reviews.map(review => (
                            <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3 mb-2">
                                    {review.userPhoto ? (
                                        <img src={review.userPhoto} alt={review.userName} className="w-8 h-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                            <UserCircleIcon className="w-6 h-6" />
                                        </div>
                                    )}
                                    <span className="font-bold text-sm text-gray-900">{review.userName}</span>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="flex">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <StarIcon key={star} className={`w-4 h-4 ${review.rating >= star ? 'text-amber-400' : 'text-gray-200'}`} />
                                        ))}
                                    </div>
                                    <span className="text-xs text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">No reviews yet. Be the first to review this product!</p>
                    )}
                </div>

                {isModalOpen && <ReviewModal onClose={() => setIsModalOpen(false)} onSubmit={handleAddReview} />}
            </div>
        </div>
    );
};

export default ProductReviews;
