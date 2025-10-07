'use client'



import {ColumnDef} from "@tanstack/react-table";
import {CustomSwitch} from "@/components/app-custom/custom-switch";

export interface IServiceMyPlansTableColumns {
	id: number;
	branch: string;
	subscriptionType: string;
	date: string;
	auto: boolean;
}

// onChange: (row: IServiceMyPlansTableColumns) => void

export const ServiceMyPlansTableColumns = (): ColumnDef<IServiceMyPlansTableColumns>[] => [
	{
		accessorKey: "branch",
		header: "Branch"
	},
	{
		accessorKey: "subscriptionType",
		header: "Subscription type",
	},
	{
		accessorKey: "date",
		header: "Due date"
	},
	{
		accessorKey: "auto",
		header: "Auto renewal",
		cell: ({row}) => {
			const origin = row.original;
			return (
					<CustomSwitch
							// checked={origin.auto}
							id={`${origin.id}`}
					/>
			)
		}
	},
]
