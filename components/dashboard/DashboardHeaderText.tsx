'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import CalendarIcon from "@/assets/icons/dashboard/CalendarIcon.svg"
import ListIcon from "@/assets/icons/dashboard/list.svg"
import {Button} from "@/components/ui/button";

interface IDashboardHeaderText {
	title: string;
	subtitle: string
	viewMode?: 'calendar' | 'list' | null
	switchViewMode?: () => void
}

export default function DashboardHeaderText({title, subtitle, viewMode = null, switchViewMode}: IDashboardHeaderText) {
	return (
			<DashboardContainer className={'flex flex-col 600:flex-row gap-y-4 600:items-center justify-between'}>
				<div className={'flex flex-col gap-2'}>
					<h3 className={'text-steel-blue font-semibold text-[2rem] leading-[3rem]'}>{title}</h3>
					<h4 className={'text-xl text-misty-gray'}>{subtitle}</h4>
				</div>
				{viewMode && (
						<Button onClick={switchViewMode} className={'flex max-w-[13.625rem] h-12 items-center justify-center rounded-[8px] gap-x-2 px-4 bg-steel-blue/5 '}>
							{viewMode === 'calendar' ? <ListIcon className={'!size-5 text-steel-blue'}/> : <CalendarIcon className={'!size-5 text-steel-blue'}/>}
							<span className={'text-dark-gray text-sm font-medium'}>Switch to {viewMode === 'calendar' ? 'list' : 'calendar'} view</span>
						</Button>
				)}
			</DashboardContainer>
	)
}
