"use client"

import * as React from "react"
import { format } from "date-fns"
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
}

export function DatePicker({
		date,
		setDate,
		placeholder = 'Date selection',
		buttonClassname,
		placeholderClassname,
		isItalicPlaceholder = false
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
							initialFocus
					/>
				</PopoverContent>
			</Popover>
	)
}