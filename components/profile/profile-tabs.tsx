'use client'

import DashboardContainer from "@/components/dashboard/DashboardContainer";

import {Star} from 'lucide-react'
import ToolsIcon from '@/assets/icons/dashboard/ToolIcon.svg'
import {cn} from "@/lib/utils";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import ProfileSendOfferButton from "@/components/profile/profile-send-offer-button";

interface IProfileTabs {
	activeTab: number;
	onChange: (tab: number) => void;
	type?: 'service' | 'store'
}

export default function ProfileTabs(
		{
				activeTab,
				onChange,
			type = 'service'
		}: IProfileTabs
) {

	const tabs = [
		{
			id: 0,
			text: type === 'service' ? 'Company Services' : 'Spare parts',
			icon: <ToolsIcon className={'!size-6 text-sky-blue'}/>,
			borderColor: '#00A6FB',
		},
		{
			id: 1,
			text: 'Company Reviews',
			icon: <Star className={'text-6 text-sunset-peach'}/>,
			borderColor: '#F9B774',
		},
	]

	return (
			<div className={'border-b border-b-soft-gray w-full mt-10'}>
				<DashboardContainer className={'flex flex-col gap-y-4 570:flex-row 570:items-center justify-between'}>
					<div className={'flex gap-x-10'}>
						{tabs.map((tab) => {
							return (
									<div
											key={tab.id}
											style={activeTab === tab.id ? {borderBottom: `2px solid ${tab.borderColor}`} : {}}
											className={'cursor-pointer flex py-4 items-center justify-center gap-x-3'}
											onClick={() => onChange(tab.id)}
									>
										{tab.icon}
										<h5 className={cn('text-misty-gray text-sm', activeTab === tab.id && 'text-dark-gray font-medium')}>{tab.text}</h5>
									</div>
							)
						})}
					</div>

					{activeTab !== 0 && <ProfileSendOfferButton type={type}/>}
				</DashboardContainer>
			</div>
	)
}
