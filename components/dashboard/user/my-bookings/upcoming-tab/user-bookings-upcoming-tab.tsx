'use client'


import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import {
	UserBookingUpcoming,
	UserBookingUpcomingTabColumns
} from "@/components/dashboard/user/my-bookings/upcoming-tab/user-bookings-upcoming-tab-columns";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import UserCancelReservationPopup
	from "@/components/dashboard/user/my-bookings/upcoming-tab/user-cancel-reservation-popup";
import {useState} from "react";
import UserRescheduleBookingPopup
	from "@/components/dashboard/user/my-bookings/upcoming-tab/user-reschedule-booking-popup";

export default function UserBookingsUpcomingTab() {

	const [cancelledRow, setCancelledRow] = useState<UserBookingUpcoming | null>(null);
	const [rescheduledId, setRescheduledId] = useState<number | null>(null);

	const data: UserBookingUpcoming[] = [
		{
			id: 0,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			askedSpareParts: []
		},
		{
			id: 1,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			askedSpareParts: []
		},
		{
			id: 2,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			askedSpareParts: []
		}
	]

	return (
			<DashboardContainer>
				<CustomDataTable columns={UserBookingUpcomingTabColumns((row) => setCancelledRow(row), (id) => setRescheduledId(id))} data={data} />
				<UserCancelReservationPopup cancelledRow={cancelledRow} closePopup={() => setCancelledRow(null)} />
				<UserRescheduleBookingPopup rescheduledId={rescheduledId} closePopup={() => setRescheduledId(null)} />
			</DashboardContainer>
	)
}
