"use client"

import * as React from "react"
import { addDays, format } from "date-fns"
import {Calendar as CalendarIcon, ChevronDown} from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import {selectTriggerClassname} from "@/components/app-custom/custom-select";


interface IDateRangePicker {
	showIcon?: boolean
	divClassname?: string
	buttonClassname?: string
}

export function DatePickerWithRange({
																			showIcon = false,
																			divClassname,
																			buttonClassname
																		}: IDateRangePicker) {
	const [date, setDate] = React.useState<DateRange | undefined>()
	// {
	// 	from: new Date(2022, 0, 20),
	// 			to: addDays(new Date(2022, 0, 20), 5),
	// }
	return (
			<div className={cn("w-full grid gap-2", divClassname)}>
				<Popover>
					<PopoverTrigger asChild>
						<Button
								id="date"
								variant={"outline"}
								className={cn(
										"w-full flex justify-between items-center",
										!date && "text-muted-foreground",selectTriggerClassname,buttonClassname
								)}
						>
							{showIcon && <CalendarIcon />}
							{date?.from ? (
									date.to ? (
											<>
												{format(date.from, "LLL dd")} -{" "}
												{format(date.to, "LLL dd")}
											</>
									) : (
											format(date.from, "LLL dd, y")
									)
							) : (
									<span>Date</span>
							)}
							<ChevronDown className="h-4 w-4 opacity-50" />
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-full p-0" align="start">
						<Calendar
								initialFocus
								mode="range"
								defaultMonth={date?.from}
								selected={date}
								onSelect={setDate}
								numberOfMonths={1}
								showYearSwitcher={false}
						/>
					</PopoverContent>
				</Popover>
			</div>
	)
}
