"use client"

import * as React from "react"
import { format, startOfToday } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"


interface IDatePicker {
	date?: Date | undefined
	setDate?: (date: Date | undefined) => void
	placeholder?: string
	buttonClassname?: string
	placeholderClassname?: string
	isItalicPlaceholder?: boolean
	maxDate?: Date
}

export function DatePicker({
		date,
		setDate,
		placeholder = 'Date selection',
		buttonClassname,
		placeholderClassname,
		isItalicPlaceholder = false,
		maxDate
													 }: IDatePicker) {

	return (
			<Popover>
				<PopoverTrigger asChild>
					<Button
							className={cn(
									"w-full flex items-center justify-between py-3 px-4 rounded-[12px] border bg-white border-soft-gray",
									buttonClassname
							)}
					>
						{date ? format(date, "PPP") : <h5 className={cn('text-sm font-medium text-misty-gray',placeholderClassname, isItalicPlaceholder && 'italic')}>{placeholder}</h5>}
						<CalendarIcon className={'text-charcoal size-5 font-semibold'}/>
					</Button>
				</PopoverTrigger>
				<PopoverContent className="w-auto p-0">
					<Calendar
							className={'w-full'}
							mode="single"
							selected={date}
							onSelect={(date) => setDate && setDate(date)}
							disabled={(date) => {
								if (!maxDate) return false;
								// Compare dates at start of day to ignore time
								const maxDateStart = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
								const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
								return dateStart > maxDateStart;
							}}
							initialFocus
					/>
				</PopoverContent>
			</Popover>
	)
}