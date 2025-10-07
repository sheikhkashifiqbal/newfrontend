import React, { useState } from 'react';

const PerformanceCenter = () => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative transition-all duration-300 ease-in-out flex flex-col gap-y-0">
            <div
                className="max-w-sm rounded overflow-hidden shadow-lg p-6 bg-white transition-all duration-300 ease-in-out"

            >
                <div className="text-center">
                    <h2 className="text-xl font-bold">Performance Center</h2>
                    <p className="text-lg">4.5</p>
                </div>
                <div className="mt-4">
                    <h3 className="text-md font-semibold">Most booked service</h3>
                    <ul className="mt-2">
                        <li>Engine</li>
                        <li>Battery</li>
                        <li>Tire</li>
                        <li>Electronics</li>
                        <li>Brake</li>
                        <li>Electronics</li>
                    </ul>
                </div>
                <div className="mt-4">
                    <p className="text-sm">34% already booked</p>
                </div>
            </div>
            {/* Button Container with Absolute Positioning */}
            <div
                className={`absolute top-full left-0 w-full overflow-hidden transition-all duration-300 ease-in-out ${
                    isHovered ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <button className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Make a reservation
                </button>
            </div>
        </div>
    );
};

export default PerformanceCenter;
