'use client'

import { Button } from "@/components/ui/button";
import CalendarIcon from "@/assets/icons/dashboard/CalendarIcon.svg";
import LogoutIcon from "@/assets/icons/dashboard/LogoutIcon.svg";
import UserIcon from "@/assets/icons/dashboard/UserIcon.svg"
import ToolIcon from "@/assets/icons/dashboard/ToolIcon.svg"
import { cn } from "@/lib/utils";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import NavTabs from "@/components/nav-tabs";
import React from "react";


interface IServiceDashboardHeader {
	active: number
	setActive: (index: number) => void
}

const tabItems = [
	{
		label: "My bookings",
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path
					d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
	{
		label: "Spare part request",
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path
					d="M7 7H17V17H7V7Z"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
				<path d="M3 3L21 21" strokeWidth="1.5" strokeLinecap="round" />
			</svg>
		),
	},
	{
		label: "Profile info",
		icon: (
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path
					d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		),
	},
];


export default function ServiceDashboardHeader() {

	const handleTopTabsChange = (label: string) => {
		if (label === "Profile info") {
			window.location.href = "/profile/manager";
			return;
		}
		if (label === "Spare part request") {
			window.location.href = "/spare-parts/branch-bookings";
			return;
		}
		if (label === "My bookings") {
			window.location.href = "/services/branch-bookings";
			return;
		}
	};

	return (
		<DashboardContainer className={'flex items-start justify-between flex-col 650:items-center gap-y-5 650:flex-row'}>
			<ScrollArea className={'w-full'}>
				<section className="py-8">
					<div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
						  <div className="flex items-center gap-3">
							{tabItems.map((item) => (
							  <button
								key={item.label}
								className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${
								  "My bookings" === item.label ? "bg-blue-50 !text-[#3F72AF]" : ""
								}`}
								onClick={() => handleTopTabsChange(item.label)}
							  >
								{React.isValidElement(item.icon)
								  ? React.cloneElement(
									  item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>,
									  {
										stroke: "My bookings" === item.label ? "#3F72AF" : "#495057",
									  }
									)
								  : item.icon}
					
								{item.label}
							  </button>
							))}
						  </div>
						</div>
				</section>
				<ScrollBar className={'h-0'} orientation="horizontal" />
			</ScrollArea>

		</DashboardContainer>
	)
}
