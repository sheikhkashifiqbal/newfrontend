'use client'

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {cn} from "@/lib/utils";
import CarIcon from "@/assets/icons/dashboard/CarIcon.svg";
import ProfileEditIcon from "@/assets/icons/dashboard/ProfileEditIcon.svg";
import SecurityIcon from "@/assets/icons/dashboard/SecurityIcon.svg";
import {memo, useState} from "react";
import UserCarsTab from "@/components/dashboard/user/profile-info/car-tab/user-cars-tab";
import UserAccountTab from "@/components/dashboard/user/profile-info/account-tab/user-account-tab";
import UserSecurityDetailsTab from "@/components/dashboard/user/profile-info/security-tab/user-security-details-tab";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";

function UserProfile() {

	const tabs = [
		{
			index: 0,
			icon: CarIcon,
			text: "My Cars"
		},
		{
			index: 1,
			icon: ProfileEditIcon,
			text: "Account details"
		},
		{
			index: 2,
			icon: SecurityIcon,
			text: "Security details"
		},
	]

	const [activeTab, setActiveTab] = useState(0);

	return (
			<div className={'pt-5 flex flex-col gap-y-5'}>

				<DashboardHeaderText title={'Profile info'} subtitle={'Everything about your profile'} />

				<div className={'w-full border-b border-b-soft-gray'}>
					<DashboardContainer>
						<ScrollArea>
							<div className={'flex gap-10'}>
								{tabs.map((tab) => {
									const isActiveTab = tab.index === activeTab;
									const IconComponent = tab.icon
									return (
											<div onClick={() => setActiveTab(tab.index)} key={tab.text} className={cn('cursor-pointer text-sm flex min-w-fit w-[144px] text-misty-gray items-center justify-center gap-3 py-4', isActiveTab && 'text-dark-gray font-medium border-b-2 border-b-slate-gray')}>
												<IconComponent className={'!size-6'}/>
												{tab.text}
											</div>
									)
								})}
							</div>
							<ScrollBar className={'h-0'} orientation="horizontal" />
						</ScrollArea>
					</DashboardContainer>
				</div>

				{activeTab === 0 && <UserCarsTab />}
				{activeTab === 1 && <UserAccountTab />}
				{activeTab === 2 && <UserSecurityDetailsTab />}
			</div>
	)
}
export default memo(UserProfile)
