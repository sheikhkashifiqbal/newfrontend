'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import UserRequiredSparePartPopup
	from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-required-spare-part-popup";
import {useState} from "react";
import {
	UserRequiredSparePartAcceptedRequestsColumns,
	UserSparePartAcceptedReq
} from "@/components/dashboard/user/spare-part-request/accepted-requests-tab/user-required-spare-part-accepted-requests-columns";


export default function UserRequiredSparePartAcceptedRequests() {

	const [viewedRow, setViewedRow] = useState<null | UserSparePartAcceptedReq>(null)

	const data: UserSparePartAcceptedReq[] = [
		{
			id: 0,
			date: "2023-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'New',
			spareParts: [],
		},
		{
			id: 1,
			date: "2024-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'Old',
			spareParts: [],
		},
		{
			id: 2,
			date: "2025-03-08",
			service: "Performance Center, Baku, Babek Ave 23.",
			vin: '27393A7GDB67WOP921',
			carPart: 'Engine',
			state: 'New',
			spareParts: [],
		}
	]

	return (
			<DashboardContainer>
				<CustomDataTable
						columns={UserRequiredSparePartAcceptedRequestsColumns((row) => setViewedRow(row))}
						data={data}
				/>
				<UserRequiredSparePartPopup actions={true} viewedRow={viewedRow} closePopup={() => setViewedRow(null)} />
			</DashboardContainer>
	)
}
