'use client'

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import {
	UserSparePartAccepted, UserSparePartAcceptedOffersTabColumns
} from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers-columns";
import {useState} from "react";
import UserReviewExperiencePopup
	from "@/components/dashboard/user/my-bookings/completed-tab/user-review-experience-popup";
import UserRequiredSparePartPopup
	from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-required-spare-part-popup";

export default function UserSparePartAcceptedOffers() {

	const [reviewedRow, setReviewedRow] = useState<null | UserSparePartAccepted>(null);

	const [viewedRow, setViewedRow] = useState<null | UserSparePartAccepted>(null);


	const data: UserSparePartAccepted[] = [
		{
			id: 0,
			date: "2023-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'New',
			spareParts: [],
			action: '+994 55 995 47 65',
			review: null,
		},
		{
			id: 1,
			date: "2024-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'Old',
			spareParts: [],
			action: '+994 55 995 47 65',
			review: 5.0,
		},
		{
			id: 2,
			date: "2025-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'New',
			spareParts: [],
			action: '+994 55 995 47 65',
			review: 4.0,
		}
	]

	return (
			<DashboardContainer>
				<CustomDataTable columns={UserSparePartAcceptedOffersTabColumns((row) => setReviewedRow(row), (row) => setViewedRow(row))} data={data} />
				<UserReviewExperiencePopup reviewedRow={reviewedRow} closePopup={() => setReviewedRow(null)} />
				<UserRequiredSparePartPopup  viewedRow={viewedRow} closePopup={() => setViewedRow(null)}/>
			</DashboardContainer>
	)
}
