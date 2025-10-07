'use client'

import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import UpcomingIcon from "@/assets/icons/dashboard/clock-fast-forward.svg"
import CompletedIcon from "@/assets/icons/dashboard/check-circle-broken.svg"
import CancelledIcon from "@/assets/icons/dashboard/slash-circle.svg"
import {useState} from "react";
import UserBookingsUpcomingTab from "@/components/dashboard/user/my-bookings/upcoming-tab/user-bookings-upcoming-tab";
import UserBookingsCompletedTab
	from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab";

export default function UserBookings() {

	const tabs = [
		{
			index: 0,
			icon: <UpcomingIcon className={'!size-6'} />,
			text: "Upcoming",
			borderColor: '#00A6FB',
		},
		{
			index: 1,
			icon: <CompletedIcon className={'!size-6 text-[#2DC653]'} />,
			text: "Completed",
			borderColor: '#2DC653'
		},
		{
			index: 2,
			icon: <CancelledIcon className={'!size-6'} />,
			text: "Cancelled",
			borderColor: '#E01E37'
		},
	]
	const [activeTab, setActiveTab] = useState(0);

	return (
			<div className={'pt-5 flex flex-col gap-y-5'}>
				<DashboardHeaderText title={'My Bookings'} subtitle={'See your scheduled services from your calendar.'} />


				<div className={'w-full border-b border-b-soft-gray'}>
					<DashboardContainer>
						<ScrollArea>
							<div className={'flex gap-10'}>
								{tabs.map((tab) => {
									const isActiveTab = tab.index === activeTab;
									const IconComponent = tab.icon
									return (
											<div
													onClick={() => setActiveTab(tab.index)}
													key={tab.text}
													style={isActiveTab ? { borderColor: tab.borderColor, borderBottomWidth: '2px' } : {}}
													className={cn(
															'cursor-pointer text-sm flex min-w-fit w-[144px] text-misty-gray items-center justify-center gap-3 py-4',
															isActiveTab && `text-dark-gray font-medium border-b-2`)}
											>
													{IconComponent}
													{tab.text}
											</div>
									)
								})}
							</div>
							<ScrollBar className={'h-0'} orientation="horizontal" />
						</ScrollArea>
					</DashboardContainer>
				</div>

				{activeTab === 0 && <UserBookingsUpcomingTab />}
				{activeTab === 1 && <UserBookingsCompletedTab />}

			</div>
	)
}
