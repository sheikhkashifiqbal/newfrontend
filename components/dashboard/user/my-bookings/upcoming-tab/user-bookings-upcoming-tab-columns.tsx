"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type UserBookingUpcoming = {
	id: number;
	service: string;
	time: string;
	car: string;
	serviceType: string;
	askedSpareParts: any[];
}


export const UserBookingUpcomingTabColumns = (onCancel: (row: UserBookingUpcoming) => void, onReschedule: (id: number) => void): ColumnDef<UserBookingUpcoming>[] =>  [
	{
		accessorKey: "service",
		header: "Service & Location"
	},
	{
		accessorKey: "time",
		header: "Reservation time",
	},
	{
		accessorKey: "car",
		header: "Selected car & Number"
	},
	{
		accessorKey: "serviceType",
		header: "Service type"
	},
	{
		accessorKey: "askedSpareParts",
		header: "Spare parts asked by service",
		cell: ({row}) => {
			return (
					<Button className={'text-steel-blue text-xs font-semibold border border-[#DCE8F6] bg-[#F8FBFF] rounded-[8px] h-8 px-4'}>
						View / Search
					</Button>
			)
		}
	},
	{
		id: "actions",
		cell: ({ row, column, cell }) => {
			const currRow = row.original;
			return (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button  className="h-8 w-8 p-0">
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent className={'bg-white rounded-[12px] p-4 max-h-20 flex flex-col gap-2'} align="end">
							{/*<DropdownMenuLabel>Actions</DropdownMenuLabel>*/}
							<DropdownMenuItem
									className={'!text-charcoal font-medium text-sm'}
									onClick={() => onReschedule(currRow.id)}
							>
								Reschedule booking
							</DropdownMenuItem>
							{/*<DropdownMenuSeparator />*/}
							<DropdownMenuItem
									className={'font-medium text-sm !text-bold-red'}
									onClick={() => onCancel(currRow)}
							>
								Cancel the booking
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
			)
		}
	}
]
