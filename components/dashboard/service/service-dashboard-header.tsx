'use client'

import {Button} from "@/components/ui/button";
import CalendarIcon from "@/assets/icons/dashboard/CalendarIcon.svg";
import LogoutIcon from "@/assets/icons/dashboard/LogoutIcon.svg";
import UserIcon from "@/assets/icons/dashboard/UserIcon.svg"
import ToolIcon from "@/assets/icons/dashboard/ToolIcon.svg"
import {cn} from "@/lib/utils";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";


interface IServiceDashboardHeader {
	active: number
	setActive: (index: number) => void
}

export default function ServiceDashboardHeader( {
																							 active,
																							 setActive
																						 }: IServiceDashboardHeader) {
	const buttons = [
		{
			index: 0,
			text: "My bookings",
			icon: CalendarIcon
		},
		{
			index: 1,
			text: "Profile info",
			icon: UserIcon
		}
	]

	return (
			<DashboardContainer className={'flex items-start justify-between flex-col 650:items-center gap-y-5 650:flex-row'}>
				<ScrollArea className={'w-full'}>
					<div className={'flex items-center gap-4'}>
						{buttons.map((btn) => {
							const IconComponent = btn.icon;
							const isActive = btn.index === active
							return (
									<Button
											onClick={() => setActive(btn.index)}
											key={btn.text}
											className={cn('h-12 flex items-center  justify-center gap-2 py-2 px-4 rounded-[8px]', isActive && 'bg-steel-blue/10')}>
										<IconComponent className={cn('!size-6', isActive && 'text-steel-blue')}/>
										<span className={cn('text-dark-gray text-sm font-medium', isActive && 'text-steel-blue font-semibold')}>{btn.text}</span>
									</Button>
							)
						})}
					</div>
					<ScrollBar className={'h-0'} orientation="horizontal" />
				</ScrollArea>

				<Button className={'h-12 flex items-center justify-center gap-2 border text-dark-gray text-sm font-medium border-soft-gray py-2 px-4 rounded-[8px]'}>
					<LogoutIcon className={'!size-6'}/>
					Log out
				</Button>
			</DashboardContainer>
	)
}
