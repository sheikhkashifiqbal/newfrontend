'use client'


import {cn} from "@/lib/utils";

interface ISmallNumBadge {
	num: number
	active?: boolean
}

export default function SmallNumBadge({num, active = false}: ISmallNumBadge) {
	return (
			<div className={cn('bg-inherit border border-soft-gray rounded-[40px] items-center justify-center py-0.5 px-3 text-misty-gray text-sm', active && 'text-dark-gray')}>
				{num}
			</div>
	)
}
