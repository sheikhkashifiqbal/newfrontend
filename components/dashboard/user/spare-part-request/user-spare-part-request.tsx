'use client'


import AcceptedOfferIcon from "@/assets/icons/dashboard/check-circle-broken.svg";
import AcceptedRequestIcon from "@/assets/icons/dashboard/clock-check.svg";
import PendingIcon from "@/assets/icons/dashboard/clock-refresh.svg";
import {useState} from "react";
import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import UserSparePartAcceptedOffers
	from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers";
import UserRequiredSparePartAcceptedRequests
	from "@/components/dashboard/user/spare-part-request/accepted-requests-tab/user-required-spare-part-accepted-requests";
import UserRequiredSparePartPendingRequests
	from "@/components/dashboard/user/spare-part-request/pending-tab/user-required-spare-part-pending-requests";

export default function UserSparePartRequest() {

	const tabs = [
		{
			index: 0,
			icon: <AcceptedOfferIcon className={'!size-6 !text-[#00A6FB]'} />,
			text: "Accepted offers",
			borderColor: '#00A6FB',
		},
		{
			index: 1,
			icon: <AcceptedRequestIcon className={'!size-6'}/>,
			text: "Accepted requests",
			borderColor: '#2DC653'
		},
		{
			index: 2,
			icon: <PendingIcon className={'!size-6'}/>,
			text: "Pending",
			borderColor: '#F9B774'
		},
	]

	const [activeTab, setActiveTab] = useState(0);

	return (
			<div className={'pt-5 flex flex-col gap-y-5'}>
				<DashboardHeaderText title={'Spare part request'} subtitle={'See your scheduled spare part requests from your calendar.'} />

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

				{activeTab === 0 && <UserSparePartAcceptedOffers />}
				{activeTab === 1 && <UserRequiredSparePartAcceptedRequests />}
				{activeTab === 2 && <UserRequiredSparePartPendingRequests />}
			</div>
	)
}
