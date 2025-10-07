'use client'
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {
	UserBookingCompleted, UserBookingCompletedTabColumns
} from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab-columns";
import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import UserReviewExperiencePopup
	from "@/components/dashboard/user/my-bookings/completed-tab/user-review-experience-popup";
import {useState} from "react";

export default function UserBookingsCompletedTab() {


	const [reviewedRow,setReviewedRow] = useState<null | UserBookingCompleted>(null)

	const data: UserBookingCompleted[] = [
		{
			id: 0,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			addedBy: "By Service",
			review: 4
		},
		{
			id: 1,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			addedBy: "By Service",
			review: null
		},
		{
			id: 2,
			service: 'Performance Center, Baku, Babek Ave 23.',
			time: 'Sep 5, 2024, 15:00',
			car: 'Mercedes Benz CL 65 AMG, 99-AA-999',
			serviceType: 'Oil Change',
			addedBy: "By Service",
			review: 5
		}
	]

	return (
			<DashboardContainer>
				<CustomDataTable columns={UserBookingCompletedTabColumns(row => setReviewedRow(row))} data={data} />
				<UserReviewExperiencePopup reviewedRow={reviewedRow} closePopup={() => setReviewedRow(null)} />
			</DashboardContainer>
	)
}
