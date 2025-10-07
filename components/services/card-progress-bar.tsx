import React from "react";

interface CircularProgressProps {
	percentage: number;
}

const CircularProgress: React.FC<CircularProgressProps> = ({ percentage }) => {
	const radius = 16;
	const strokeWidth = 4;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference - (percentage / 100) * circumference;

	return (
			<svg
					width="32"
					height="32"
					viewBox="0 0 40 40"
					className="rotate-[-90deg]"
			>
				{/* Background Circle */}
				<circle
						cx="20"
						cy="20"
						r={radius}
						stroke="#E9ECEF"
						strokeWidth={strokeWidth}
						fill="none"
				/>
				{/* Progress Circle */}
				<circle
						cx="20"
						cy="20"
						r={radius}
						stroke="#2DC653"
						strokeWidth={strokeWidth}
						fill="none"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						strokeLinecap="round"
						className="transition-all duration-300"
				/>
			</svg>
	);
};

export default CircularProgress;
