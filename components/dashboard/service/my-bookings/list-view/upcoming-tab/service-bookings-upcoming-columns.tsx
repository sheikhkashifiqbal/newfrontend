'use client';
import {ColumnDef} from "@tanstack/react-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreVertical} from "lucide-react";
import {format} from "date-fns";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface IReservationServiceSparepart {
	reservation_service_sparepart_id: number;
	part_name: string;
	qty: number;
	spareparts_id: number;
	spareparts_type: string;
	reservation_id: number;
}

export interface IServiceBookingReservationRow {
	user_id: number;
	reservation_date: string;
	reservation_time: string;
	branch_name: string;
	address: string;
	city: string;
	logo_img: string;
	brand_name: string;
	model_name: string;
	service_name: string;
	reservation_status: string;
	reservation_id: number;
	branch_brand_serviceid: number;
	plate_number: string;
	stars: number;
	price: number;
	currency: string;
	reservation_service_sparepart: IReservationServiceSparepart[];
}

export type ServiceBookingsTabType = "pending" | "completed" | "cancelled";

interface ICreateColumnsOptions {
	tab: ServiceBookingsTabType;
	onView: (row: IServiceBookingReservationRow) => void;
	onUpdateStatus: (row: IServiceBookingReservationRow, status: "cancelled" | "completed") => void;
}

function formatReservationDate(dateStr: string): string {
	const d = new Date(dateStr);
	if (isNaN(d.getTime())) return dateStr;
	return format(d, "MMM d, yyyy");
}

function formatReservationTime(timeStr: string): string {
	// "10:30:00" -> "10:30"
	if (!timeStr) return "";
	return timeStr.slice(0, 5);
}

export const ServiceBookingsUpcomingTabColumns = (
	options: ICreateColumnsOptions
): ColumnDef<IServiceBookingReservationRow>[] => {
	const {tab, onView, onUpdateStatus} = options;

	const baseColumns: ColumnDef<IServiceBookingReservationRow>[] = [
		{
			accessorKey: "location",
			header: "Service & Location",
			cell: ({row}) => {
				const data = row.original;
				return (
					<div className="flex items-start gap-3">
						<img
							src={`${BASE_URL}/images/${data.logo_img}`}
							alt={data.branch_name}
							className="w-10 h-10 rounded-lg object-cover bg-gray-100"
						/>
						<div className="flex flex-col">
							<span className="text-sm font-medium text-[#212529]">
								{data.branch_name}
							</span>
							<span className="text-xs text-[#6C757D] whitespace-pre-line">
								{data.address}
								{data.city ? `, ${data.city}` : ""}
							</span>
						</div>
					</div>
				);
			}
		},
		{
			accessorKey: "reservation",
			header: "Reservation time",
			cell: ({row}) => {
				const data = row.original;
				const formattedDate = formatReservationDate(data.reservation_date);
				const formattedTime = formatReservationTime(data.reservation_time);
				return (
					<div className="text-sm text-[#495057] whitespace-pre-line">
						{formattedDate}
						<br/>
						{formattedTime}
					</div>
				);
			}
		},
		{
			accessorKey: "car",
			header: "Selected car & Number",
			cell: ({row}) => {
				const data = row.original;
				return (
					<div className="text-sm text-[#495057] whitespace-pre-line">
						{data.brand_name} {data.model_name}
						<br/>
						{data.plate_number}
					</div>
				);
			}
		},
		{
			accessorKey: "service",
			header: "Service type",
			cell: ({row}) => {
				const data = row.original;
				return (
					<div className="text-sm text-[#495057]">
						{data.service_name}
					</div>
				);
			}
		},

		{
			accessorKey: "price",
			header: "Price",
			cell: ({row}) => {
				const data = row.original;
				return (
					<div className="text-sm text-[#495057]">
						{data.price} {data.currency}
					</div>
				);
			}
		}
	];

	// Upcoming tab: add Required spare part column
	if (tab === "pending") {
		baseColumns.push({
			accessorKey: "requiredSpareParts",
			header: "Required spare part",
			cell: ({row}) => {
				const origin = row.original;
				return (
					<div className="flex items-center justify-between">
						<h4
							onClick={() => onView(origin)}
							className="text-new-blue text-sm font-medium cursor-pointer"
						>
							Add / View
						</h4>
						<DropdownMenu>
							<DropdownMenuTrigger className="!max-w-5" asChild>
								<Button className="h-8 w-8 p-0" variant="outline">
									<MoreVertical className="h-4 w-4"/>
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="bg-white rounded-[12px] p-4 max-h-24 flex flex-col gap-2"
								align="end"
							>
								<DropdownMenuItem
									className="!text-charcoal font-medium text-sm"
									onClick={() => onUpdateStatus(origin, "cancelled")}
								>
									Cancel
								</DropdownMenuItem>
								<DropdownMenuItem
									className="font-medium text-sm !text-bold-green"
									onClick={() => onUpdateStatus(origin, "completed")}
								>
									Complete
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				);
			}
		});
	}

	// Completed / Cancelled: add Review column instead of Required spare part
	if (tab === "completed" || tab === "cancelled") {
		baseColumns.push({
			accessorKey: "review",
			header: "Review",
			cell: () => {
				return (
					<button
						type="button"
						className="text-new-blue text-sm font-medium underline underline-offset-2"
						onClick={() => {
							// placeholder; can be wired later
						}}
					>
						review
					</button>
				);
			}
		});
	}

	return baseColumns;
};
