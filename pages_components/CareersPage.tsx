import React from 'react';

const jobOpenings = [
    {
        title: "Senior Smartphone Technician",
        location: "Kathmandu, Nepal",
        type: "Full-time",
        description: "We are looking for an experienced technician to diagnose, repair, and certify pre-owned smartphones. Level 3 repair skills and experience with multiple brands (Apple, Samsung, etc.) are required.",
    },
    {
        title: "Customer Support Specialist",
        location: "Remote (Nepal)",
        type: "Full-time",
        description: "Join our support team to help customers with their buying, selling, and repair inquiries. Excellent communication skills in Nepali and English are a must.",
    },
    {
        title: "Digital Marketing Manager",
        location: "Kathmandu, Nepal",
        type: "Full-time",
        description: "Lead our marketing efforts to grow our brand presence online. Experience with SEO, social media marketing, and e-commerce campaigns is essential.",
    },
];

const CareersPage: React.FC = () => {
    return (
        <div className="py-16">
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">Join Our Team</h1>
                    <p className="mt-4 text-lg text-gray-600 mx-auto">
                        We're on a mission to revolutionize the tech industry in Nepal. If you're passionate, driven, and want to make an impact, we'd love to hear from you.
                    </p>
                </div>

                <div className="max-w-3xl mx-auto space-y-8">
                    {jobOpenings.map((job, index) => (
                        <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{job.title}</h2>
                                    <p className="text-sm text-gray-500">{job.location} &middot; {job.type}</p>
                                </div>
                                <a href="mailto:careers@mobistore.com" className="bg-amber-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-amber-700 transition-colors text-sm">
                                    Apply Now
                                </a>
                            </div>
                            <p className="mt-4 text-gray-700">{job.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CareersPage;
