'use client'


import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";


import CalendarCheckIcon from '@/assets/icons/dashboard/calendar-check.svg'
import ToolIcon from '@/assets/icons/dashboard/ToolIcon.svg'
import ProfileEdit from '@/assets/icons/dashboard/user-edit.svg'
import SecurityIcon from '@/assets/icons/dashboard/SecurityIcon.svg'
import BuildingIcon from '@/assets/icons/dashboard/building.svg'
import FilePlusIcon from '@/assets/icons/dashboard/file-plus.svg'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import {useState} from "react";
import ServiceWorkScheduleTab
	from "@/components/dashboard/service/profile-info/work-schedule-tab/service-work-schedule-tab";
import ServiceServicesTab from "@/components/dashboard/service/profile-info/services-tab/service-services-tab";
import ServiceAccountDetailsTab
	from "@/components/dashboard/service/profile-info/account-details-tab/service-account-details-tab";
import ServiceSecurityDetailsTab
	from "@/components/dashboard/service/profile-info/security-details-tab/service-security-details-tab";
import {ServiceMyBranchesTab} from "@/components/dashboard/service/profile-info/my-branches-tab/service-my-branches-tab";
import ServiceMyPlans from "@/components/dashboard/service/profile-info/my-plans-tab/service-my-plans";


export default function ServiceProfile() {

	const tabs = [
		{
			index: 0,
			text: 'Work schedule',
			icon: CalendarCheckIcon
		},
		{
			index: 1,
			text: 'My services',
			icon: ToolIcon
		},
		{
			index: 2,
			text: 'Account details',
			icon: ProfileEdit
		},
		{
			index: 3,
			text: 'Security details',
			icon: SecurityIcon
		},
		{
			index: 4,
			text: 'My branches',
			icon: BuildingIcon
		},
		{
			index: 5,
			text: 'My plans',
			icon: FilePlusIcon
		}
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

				{activeTab === 0 && <ServiceWorkScheduleTab />}
				{activeTab === 1 && <ServiceServicesTab />}
				{activeTab === 2 && <ServiceAccountDetailsTab />}
				{activeTab === 3 && <ServiceSecurityDetailsTab />}
				{activeTab === 4 && <ServiceMyBranchesTab />}
				{activeTab === 5 && <ServiceMyPlans />}
			</div>
	)
}
