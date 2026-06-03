
import React, { useState, useEffect } from 'react';
import { StarIcon } from './icons/StarIcon';
import * as api from '../services/api';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                const data = await api.getTestimonials();
                if (data.length > 0) {
                    setTestimonials(data.slice(0, 3)); // Show latest 3
                } else {
                    setTestimonials([]);
                }
            } catch (e) {
                console.error("Failed to load testimonials", e);
            }
        };
        fetchTestimonials();
    }, []);

    if (testimonials.length === 0) return null;

    return (
        <section className="py-16 sm:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Trusted by Thousands</h2>
                    <p className="mt-4 mx-auto text-lg text-gray-600">
                        Here's what our happy customers in Nepal are saying.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial) => (
                        <div key={testimonial.id} className="bg-white border border-gray-200 p-8 rounded-lg shadow-lg flex flex-col">
                            <div className="flex items-center mb-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <StarIcon key={i} className="w-5 h-5 text-amber-500" />
                                ))}
                            </div>
                            <blockquote className="text-gray-600 italic mb-6 flex-grow">"{testimonial.quote}"</blockquote>
                            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100">
                                {testimonial.imageUrl ? (
                                    <img src={testimonial.imageUrl} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-xl">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
