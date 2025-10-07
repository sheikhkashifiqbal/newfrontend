'use client'

import {useState} from "react";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomDataTable} from "@/components/app-custom/custom-data-table";
import {
	IServiceBookingUpcoming, ServiceBookingsUpcomingTabColumns
} from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-columns";
import ServiceBookingsAddEditSparePartsPopup
	from "@/components/dashboard/service/my-bookings/service-bookings-add-edit-spare-parts-popup";

export default function ServiceBookingsUpcomingTab() {



	const data: IServiceBookingUpcoming[] = [
		{
			id: 1,
			date: '20.12.2024, 14:30',
			car: 'Mercedes Benz CL 65 AMG',
			plate: '99-AA-999',
			boxNumber: 1,
			serviceType: 'Engine',
			requiredSpareParts: []
		},
		{
			id: 1,
			date: '20.12.2024, 14:30',
			car: 'Mercedes Benz CL 65 AMG',
			plate: '99-AA-999',
			boxNumber: 1,
			serviceType: 'Engine',
			requiredSpareParts: []
		},
		{
			id: 1,
			date: '20.12.2024, 14:30',
			car: 'Mercedes Benz CL 65 AMG',
			plate: '99-AA-999',
			boxNumber: 1,
			serviceType: 'Engine',
			requiredSpareParts: []
		},
		{
			id: 1,
			date: '20.12.2024, 14:30',
			car: 'Mercedes Benz CL 65 AMG',
			plate: '99-AA-999',
			boxNumber: 1,
			serviceType: 'Engine',
			requiredSpareParts: []
		},
	]

	const [viewedRow, setViewedRow] = useState<IServiceBookingUpcoming | null>(null)
	return (
			<DashboardContainer>
				<CustomDataTable columns={ServiceBookingsUpcomingTabColumns((row) => setViewedRow(row))} data={data} />
				<ServiceBookingsAddEditSparePartsPopup selectedRow={viewedRow?.id} closePopup={() => setViewedRow(null)} />
			</DashboardContainer>
	)
}
