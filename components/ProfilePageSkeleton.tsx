import React from 'react';

const ProfilePageSkeleton: React.FC = () => {
    return (
        <div className="w-full px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                            <div className="h-6 w-3/4 bg-gray-700 rounded mt-4"></div>
                            <div className="h-4 w-1/2 bg-gray-700 rounded mt-2"></div>
                        </div>
                        <div className="mt-6 space-y-3">
                            <div className="h-10 w-full bg-gray-700 rounded-md"></div>
                            <div className="h-10 w-full bg-gray-700 rounded-md"></div>
                        </div>
                        <div className="mt-6 h-5 w-1/3 mx-auto bg-gray-700 rounded"></div>
                    </div>
                </aside>

                <main className="md:w-3/4">
                    <div className="bg-black p-6 rounded-lg shadow-md border border-gray-800">
                        <div className="h-8 w-1/3 bg-gray-700 rounded mb-6"></div>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="border border-gray-700 rounded-lg p-4">
                                    <div className="h-5 w-1/2 bg-gray-700 rounded"></div>
                                    <div className="h-4 w-1/3 bg-gray-700 rounded mt-2"></div>
                                    <div className="h-4 w-3/4 bg-gray-700 rounded mt-2"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProfilePageSkeleton;
