'use client'


import {ColumnDef} from "@tanstack/react-table";
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, MoreVertical} from "lucide-react";

export interface IServiceBookingUpcoming {
	id: number;
	date: string;
	car: string;
	plate: string;
	boxNumber: number;
	serviceType:string;
	requiredSpareParts: any;
}


export const ServiceBookingsUpcomingTabColumns = (onView: (row: IServiceBookingUpcoming) => void): ColumnDef<IServiceBookingUpcoming>[] => [
	{
		accessorKey: "date",
		header: "Date and Time"
	},
	{
		accessorKey: "car",
		header: "Car model",
	},
	{
		accessorKey: "plate",
		header: "Plate number"
	},
	{
		accessorKey: "boxNumber",
		header: "Box number"
	},
	{
		accessorKey: "serviceType",
		header: "Service type"
	},
	{
		accessorKey: "requiredSpareParts",
		header: "Required spare part",
		cell: ({row}) => {
			const origin = row.original;
			return (
					<div className={'flex items-center justify-between'}>
						<h4 onClick={() => onView(origin)} className={'text-new-blue text-sm font-medium cursor-pointer'}>Add</h4>
						<DropdownMenu>
							<DropdownMenuTrigger className={'!max-w-5'} asChild>
								<Button  className="h-8 w-8 p-0">
									<MoreVertical className="h-4 w-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className={'bg-white rounded-[12px] p-4 max-h-20 flex flex-col gap-2'} align="end">
								{/*<DropdownMenuLabel>Actions</DropdownMenuLabel>*/}
								<DropdownMenuItem
										className={'!text-charcoal font-medium text-sm'}
										onClick={() => {}}
								>
									some action 1
								</DropdownMenuItem>
								{/*<DropdownMenuSeparator />*/}
								<DropdownMenuItem
										className={'font-medium text-sm !text-bold-red'}
										onClick={() => {}}
								>
									some action 2
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
			)
		}
	},
	// {
	// 	id: "actions",
	// 	cell: ({ row, column, cell }) => {
	// 		const currRow = row.original;
	// 		return (
	// 				<DropdownMenu>
	// 					<DropdownMenuTrigger className={'!max-w-5'} asChild>
	// 						<Button  className="h-8 w-8 p-0">
	// 							<MoreVertical className="h-4 w-4" />
	// 						</Button>
	// 					</DropdownMenuTrigger>
	// 					<DropdownMenuContent className={'bg-white rounded-[12px] p-4 max-h-20 flex flex-col gap-2'} align="end">
	// 						{/*<DropdownMenuLabel>Actions</DropdownMenuLabel>*/}
	// 						<DropdownMenuItem
	// 								className={'!text-charcoal font-medium text-sm'}
	// 								onClick={() => {}}
	// 						>
	// 							some action 1
	// 						</DropdownMenuItem>
	// 						{/*<DropdownMenuSeparator />*/}
	// 						<DropdownMenuItem
	// 								className={'font-medium text-sm !text-bold-red'}
	// 								onClick={() => {}}
	// 						>
	// 							some action 2
	// 						</DropdownMenuItem>
	// 					</DropdownMenuContent>
	// 				</DropdownMenu>
	// 		)
	// 	}
	// }
]
