import * as React from "react"

import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import {cn} from "@/lib/utils";
import {ReactNode} from "react";

export interface ISelectExt {
	placeholder?: string
	label?: string
	triggerClassname?: string;
	contentClassname?: string;
	children: ReactNode;
	onChange?: (value: string) => void;
	value: string | undefined
	iconClassname?: string
}

export const grayTriggerClassname = 'h-14 py-3 px-4 text-charcoal rounded-[12px] text-sm italic text-misty-gray'

export function SelectExt({placeholder = "placeholder", label = "label", triggerClassname, children, contentClassname, onChange, value, iconClassname}: ISelectExt) {
	return (
			<Select value={value} onValueChange={(value) => onChange && onChange(value)}>
				<SelectTrigger iconClassname={iconClassname} className={cn('bg-white !ring-transparent !outline-transparent',triggerClassname, value && 'text-charcoal text-base not-italic')}>
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent className={cn('w-full', contentClassname)}>
					{/*<SelectGroup>*/}
					{/*	<SelectLabel>{label}</SelectLabel>*/}
					{/*	<SelectItem value="apple">Apple</SelectItem>*/}
					{/*	<SelectItem value="banana">Banana</SelectItem>*/}
					{/*	<SelectItem value="blueberry">Blueberry</SelectItem>*/}
					{/*	<SelectItem value="grapes">Grapes</SelectItem>*/}
					{/*	<SelectItem value="pineapple">Pineapple</SelectItem>*/}
					{/*</SelectGroup>*/}
					{children}
				</SelectContent>
			</Select>
	)
}
