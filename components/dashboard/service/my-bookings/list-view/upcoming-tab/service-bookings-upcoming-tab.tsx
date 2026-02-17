'use client';

import { useState } from "react";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { CustomDataTable } from "@/components/app-custom/custom-data-table";
import {
	IReservationServiceSparepart,
	IServiceBookingReservationRow,
	ServiceBookingsTabType,
	ServiceBookingsUpcomingTabColumns
} from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-columns";
import ServiceBookingsAddEditSparePartsPopup
	from "@/components/dashboard/service/my-bookings/service-bookings-add-edit-spare-parts-popup";
//import {useToast} from "@/components/ui/use-toast"; 
import { toast } from "sonner";
//:contentReference[oaicite:2]{index=2}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface IServiceBookingsUpcomingTabProps {
	tab: ServiceBookingsTabType;
	data: IServiceBookingReservationRow[];
	onRefresh: () => Promise<void> | void;
	loading?: boolean;
}

export default function ServiceBookingsUpcomingTab({
	tab,
	data,
	onRefresh,
	loading
}: IServiceBookingsUpcomingTabProps) {

	const [viewedRow, setViewedRow] = useState<IServiceBookingReservationRow | null>(null);
	//const {toast} = useToast();

	async function handleUpdateStatus(row: IServiceBookingReservationRow, status: "cancelled" | "completed") {
		const confirmMsg =
			status === "cancelled"
				? "Are you sure you want to cancel this reservation?"
				: "Are you sure you want to mark this reservation as completed?";

		if (!window.confirm(confirmMsg)) return;

		try {
			const res = await fetch(`${BASE_URL}/api/reservations/${row.reservation_id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					userId: String(row.user_id),
					reservationDate: row.reservation_date,
					reservationTime: row.reservation_time.slice(0, 5),
					reservationStatus: status
				})
			});

			if (!res.ok) throw new Error(String(res.status));

			toast.success(status);

			await onRefresh();
		} catch (e) {
			console.error("Failed to update reservation status", e);
			toast.error("Failed to update reservation status");
		}
	}

	function touchToast(status: "cancelled" | "completed") {
		toast.message("status",
			{
				description:
					status === "cancelled" ? "Reservation cancelled successfully." : "Reservation completed successfully."
			});

	}
	/*
		function touchToastError() {
			toast.message(
				variant: "destructive",
				{
				description: "Failed to update reservation status."
			});
	
			toast.message( "status",
				{
				description:
					status === "cancelled" ? "Reservation cancelled successfully." : "Reservation completed successfully."
			});
		}
	*/
	const columns = ServiceBookingsUpcomingTabColumns({
		tab,
		onView: (row) => {
			if (tab === "pending") {
				setViewedRow(row);
			}
		},
		onUpdateStatus: handleUpdateStatus
	}).filter((col: any) => col?.accessorKey !== "review");
	;


	const hasData = data && data.length > 0;

	return (
		<DashboardContainer>
			{!loading && !hasData && (
				<div className="py-10 text-center text-misty-gray text-sm">
					No bookings found for this tab.
				</div>
			)}

			{hasData && (
				<CustomDataTable columns={columns} data={data} />
			)}

			{/* Popup only for Upcoming tab */}
			{tab === "pending" && (
				<ServiceBookingsAddEditSparePartsPopup
					open={!!viewedRow}
					reservationId={viewedRow?.reservation_id ?? null}
					reservationParts={viewedRow?.reservation_service_sparepart ?? []}
					onClose={() => setViewedRow(null)}
					onSaved={onRefresh}
				/>
			)}
		</DashboardContainer>
	);
}
