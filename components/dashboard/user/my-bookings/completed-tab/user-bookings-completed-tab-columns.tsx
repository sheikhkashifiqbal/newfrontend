import {ColumnDef} from "@tanstack/react-table";

import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
export type UserBookingCompleted = {
	id: number;
	service: string;
	time: string;
	car: string;
	serviceType: string;
	addedBy: string;
	review: number | null
}


export const UserBookingCompletedTabColumns = (onReview: (row: UserBookingCompleted) => void): ColumnDef<UserBookingCompleted>[] => [
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
		accessorKey: "addedBy",
		header: "Added by"
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
