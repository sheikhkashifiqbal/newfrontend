'use client'

import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import {useState} from "react";
import {addDays, format} from "date-fns";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {cn} from "@/lib/utils";
import {CustomSwitch} from "@/components/app-custom/custom-switch";
import SmallNumBadge from "@/components/app-custom/small-num-badge";
import ServiceBookingsCalendar from "@/components/dashboard/service/my-bookings/calendar-view/service-bookings-calendar";
import ServiceBookingsListView from "@/components/dashboard/service/my-bookings/list-view/service-bookings-list-view";

export default function ServiceBookings() {
	const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => ({
		fullDate: format(addDays(today, i), 'dd MMM yyy'),
		day:format(addDays(today, i), 'dd MMM')
	}));

	const [date, setDate] = useState(next7Days[0]);


	function switchViewMode() {
		setViewMode(viewMode === 'list' ? 'calendar' : 'list');
	}




	return (
			<div className={'pt-5 flex flex-col gap-y-5'}>
				<DashboardHeaderText viewMode={viewMode} switchViewMode={switchViewMode} title={"My Bookings"} subtitle={"See your scheduled services from your calendar."} />

				<DashboardContainer>
					<div className={'flex gap-2'}>
						{next7Days.map((day, index) => {
							const [num, month] = day.day.split(' ');
							return (
									<div
											onClick={() => setDate(day)}
											key={day.fullDate}
											className={cn('cursor-pointer bg-inherit border-soft-gray flex flex-col h-16 w-[4.5rem] px-2 rounded-xl items-center justify-center text-dove-gray  font-medium', date.fullDate === day.fullDate && 'bg-white text-dark-gray border')}>
										<h5 className={'text-xl'}>{num}</h5>
										<h6 className={'text-sm'}>{month}</h6>
									</div>
							)
						})}
					</div>
				</DashboardContainer>

				{viewMode === "calendar" ? <ServiceBookingsCalendar date={date}/> : <ServiceBookingsListView />}
			</div>
	)
}
