
import React, { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Review } from '../types';
import Spinner from '../components/Spinner';
import { TrashIcon } from '../components/icons/TrashIcon';
import { StarIcon } from '../components/icons/StarIcon';
import { UserCircleIcon } from '../components/icons/UserCircleIcon';

interface AdminReviewsPageProps {
    navigate: (path: string) => void;
}

const AdminReviewsPage: React.FC<AdminReviewsPageProps> = ({ navigate }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const data = await api.getAllReviews();
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (reviewId: string) => {
        if (window.confirm("Are you sure you want to delete this review permanently?")) {
            try {
                await api.deleteReview(reviewId);
                setReviews(prev => prev.filter(r => r.id !== reviewId));
            } catch (error) {
                alert("Could not delete the review.");
            }
        }
    };

    return (
        <div className="animate-fade-in space-y-6 pb-10">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-800 drop-shadow-sm">Manage Product Reviews</h1>
                <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold shadow-sm">
                    Total: {reviews.length}
                </div>
            </div>
            
            {loading ? (
                <div className="flex justify-center p-12"><Spinner size="w-12 h-12"/></div>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {reviews.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-slate-600">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-4 font-bold tracking-wider">Date</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">User</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Product</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Rating</th>
                                            <th className="px-6 py-4 font-bold tracking-wider">Comment</th>
                                            <th className="px-6 py-4 font-bold tracking-wider text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {reviews.map(review => (
                                            <tr key={review.id} className="hover:bg-slate-50 transition-colors bg-white group">
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(review.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 font-medium text-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        {review.userPhoto ? (
                                                            <img src={review.userPhoto} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                                                                <UserCircleIcon className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        {review.userName}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <a 
                                                        href={`/buy/${review.productId}`} 
                                                        onClick={(e) => { e.preventDefault(); navigate(`/buy/${review.productId}`); }} 
                                                        className="text-blue-600 hover:underline hover:text-blue-700 font-mono text-xs bg-blue-50 px-2 py-1 rounded"
                                                    >
                                                        {review.productId}
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center font-bold text-slate-800">
                                                        {review.rating} <StarIcon className="w-4 h-4 text-amber-500 ml-1" />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 max-w-sm truncate text-slate-600" title={review.comment}>{review.comment}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => handleDelete(review.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Delete">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-center py-16 text-slate-500 italic">No reviews found.</p>
                        )}
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {reviews.length > 0 ? reviews.map(review => (
                            <div key={review.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        {review.userPhoto ? (
                                            <img src={review.userPhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                                <UserCircleIcon className="w-6 h-6 text-slate-400" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-sm">{review.userName}</h3>
                                            <p className="text-xs text-slate-500">{new Date(review.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDelete(review.id)} 
                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg active:scale-95 transition-transform border border-rose-100"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                                    <div className="flex justify-between items-center mb-2">
                                         <a 
                                            href={`/buy/${review.productId}`} 
                                            onClick={(e) => { e.preventDefault(); navigate(`/buy/${review.productId}`); }} 
                                            className="text-blue-600 hover:underline font-mono text-xs font-medium"
                                        >
                                            {review.productId}
                                        </a>
                                        <div className="flex items-center font-bold text-amber-500 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                                            {review.rating} <StarIcon className="w-4 h-4 ml-1 fill-current" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-slate-600 italic">"{review.comment}"</p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border border-slate-200">
                                No reviews found.
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminReviewsPage;
