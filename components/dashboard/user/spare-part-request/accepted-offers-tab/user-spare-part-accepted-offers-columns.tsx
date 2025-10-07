import {ColumnDef} from "@tanstack/react-table";

import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import {Button} from "@/components/ui/button";
export type UserSparePartAccepted = {
	id: number;
	date: string;
	service: string;
	vin: string;
	carPart: string;
	state: string;
	spareParts: any[];
	action: string;
	review: number | null
}


export const UserSparePartAcceptedOffersTabColumns = (onReview: (row: UserSparePartAccepted) => void, onView: (row: UserSparePartAccepted) => void): ColumnDef<UserSparePartAccepted>[] => [
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
						View
					</Button>
			)
		}
	},
	{
		accessorKey: "action",
		header: 'Action',
	},
	{
		accessorKey: "review",
		header: "Review",
		cell: ({row}) => {
			const origin = row.original
			const review = origin.review

			if(review) {
				return (
						<div className={'flex gap-1 items-center'}>
							<YellowStar className={'!size-5'}/>
							<span className={'text-charcoal text-sm font-semibold'}>{review}</span>
						</div>
				)
			}

			return (
					<div className={'flex flex-col'}>
						<h5 className={'text-charcoal/50 text-xs'}>Not reviewed yet.</h5>
						<h4 onClick={() => {onReview(origin)}} className={'text-royal-blue text-sm font-medium cursor-pointer'}>Review it</h4>
					</div>
			)
		}
	},
]
