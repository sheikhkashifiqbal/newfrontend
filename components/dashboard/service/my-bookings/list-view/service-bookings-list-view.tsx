'use client'
import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import UpcomingIcon from "@/assets/icons/dashboard/clock-fast-forward.svg";
import CompletedIcon from "@/assets/icons/dashboard/check-circle-broken.svg";
import CancelledIcon from "@/assets/icons/dashboard/slash-circle.svg";
import {useEffect, useState} from "react";
import ServiceBookingsUpcomingTab from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-tab";
import type {
	IServiceBookingReservationRow,
	IReservationServiceSparepart
} from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-columns"; 
//:contentReference[oaicite:1]{index=1}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default function ServiceBookingsListView() {

	const tabs = [
		{
			index: 0,
			icon: <UpcomingIcon className={'!size-6'} />,
			text: "Upcoming",
			borderColor: '#00A6FB',
		},
		{
			index: 1,
			icon: <CompletedIcon className={'!size-6 text-[#2DC653]'} />,
			text: "Completed",
			borderColor: '#2DC653'
		},
		{
			index: 2,
			icon: <CancelledIcon className={'!size-6'} />,
			text: "Cancelled",
			borderColor: '#E01E37'
		},
	];
	const [activeTab, setActiveTab] = useState(0);

	const [reservations, setReservations] = useState<IServiceBookingReservationRow[]>([]);
	const [loading, setLoading] = useState(false);

	async function fetchReservations() {
		try {
			setLoading(true);

			let branchId: string | null = null;

			// 1) Try direct branch_id key first
			const storedBranchId = typeof window !== "undefined" ? localStorage.getItem("branch_id") : null;
			if (storedBranchId) {
				branchId = storedBranchId;
			}

			// 2) Fallback to auth_response
			if (!branchId && typeof window !== "undefined") {
				const authRaw = localStorage.getItem("auth_response");
				if (authRaw) {
					try {
						const parsed = JSON.parse(authRaw);
						branchId = parsed?.branch_id?.toString() ?? parsed?.branchId?.toString() ?? null;
					} catch (e) {
						console.error("Failed to parse auth_response", e);
					}
				}
			}

			if (!branchId) {
				console.warn("branch_id not found in localStorage");
				setReservations([]);
				return;
			}

			const res = await fetch(`${BASE_URL}/api/reservations/by-branch`, {
				method: "POST",
				headers: {"Content-Type": "application/json"},
				body: JSON.stringify({branch_id: branchId}),
			});

			if (!res.ok) {
				console.error("Failed to fetch reservations", res.status);
				setReservations([]);
				return;
			}

			const data = await res.json();
			if (Array.isArray(data)) {
				setReservations(data as IServiceBookingReservationRow[]);
			} else {
				setReservations([]);
			}
		} catch (e) {
			console.error("Error fetching reservations", e);
			setReservations([]);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		// call API when page loads
		fetchReservations();
	}, []);

	function handleTabClick(index: number) {
		setActiveTab(index);
		// As per requirement: when Upcoming tab is active, call API
		if (index === 0) {
			fetchReservations();
		}
	}

	const upcomingReservations = reservations.filter(r => r.reservation_status === "upcoming");
	const completedReservations = reservations.filter(r => r.reservation_status === "completed");
	const cancelledReservations = reservations.filter(r => r.reservation_status === "cancelled");

	return (
		<div className={'pt-5 flex flex-col gap-y-5'}>

			<div className={'w-full border-b border-b-soft-gray'}>
				<DashboardContainer>
					<ScrollArea>
						<div className={'flex gap-10'}>
							{tabs.map((tab) => {
								const isActiveTab = tab.index === activeTab;
								const IconComponent = tab.icon;
								return (
									<div
										onClick={() => handleTabClick(tab.index)}
										key={tab.text}
										style={isActiveTab ? {borderColor: tab.borderColor, borderBottomWidth: '2px'} : {}}
										className={cn(
											'cursor-pointer text-sm flex min-w-fit w-[144px] text-misty-gray items-center justify-center gap-3 py-4',
											isActiveTab && `text-dark-gray font-medium border-b-2`
										)}
									>
										{IconComponent}
										{tab.text}
									</div>
								);
							})}
						</div>
						<ScrollBar className={'h-0'} orientation="horizontal"/>
					</ScrollArea>
				</DashboardContainer>
			</div>

			{/* Tabs content */}
			{activeTab === 0 && (
				<ServiceBookingsUpcomingTab
					tab="upcoming"
					data={upcomingReservations}
					onRefresh={fetchReservations}
					loading={loading}
				/>
			)}

			{activeTab === 1 && (
				<ServiceBookingsUpcomingTab
					tab="completed"
					data={completedReservations}
					onRefresh={fetchReservations}
					loading={loading}
				/>
			)}

			{activeTab === 2 && (
				<ServiceBookingsUpcomingTab
					tab="cancelled"
					data={cancelledReservations}
					onRefresh={fetchReservations}
					loading={loading}
				/>
			)}
		</div>
	);
}
