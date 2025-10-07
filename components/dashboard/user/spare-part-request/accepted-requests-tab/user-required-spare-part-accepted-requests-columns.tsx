'use client'


import {ColumnDef} from "@tanstack/react-table";
import {Button} from "@/components/ui/button";

export interface UserSparePartAcceptedReq {
	id: number;
	date: string;
	service: string;
	vin: string;
	carPart: string;
	state: string;
	spareParts: any[];
}


export const UserRequiredSparePartAcceptedRequestsColumns = (onView: (row: UserSparePartAcceptedReq) => void): ColumnDef<UserSparePartAcceptedReq>[] => [
	{
		accessorKey: "date",
		header: "Date",
	},
	{
		accessorKey: "service",
		header: "Service & Location"
	},
	{
		accessorKey: "vin",
		header: "VIN / Plate number"
	},
	{
		accessorKey: "carPart",
		header: "Car part"
	},
	{
		accessorKey: "state",
		header: "State"
	},
	{
		accessorKey: 'spareParts',
		header: "Spare parts",
		cell: ({row}) => {
			const origin = row.original
			const spareParts = origin.spareParts

			return (
					<Button onClick={() => onView(origin)} className={'bg-[#F8FBFF] border h-8 px-4 rounded-[8px] border-[#DCE8F6] text-steel-blue text-xs font-semibold'}>
						Accept / Decline
					</Button>
			)
		}
	},
]
