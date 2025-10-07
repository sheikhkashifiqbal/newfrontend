'use client'

import {AutosizeTextarea} from "@/components/ui/autosize-textarea";
import {HTMLInputTypeAttribute} from "react";
import {cn} from "@/lib/utils";


interface ICustomTextarea {
	placeholder?: string
	className?: string
	value: string
	onChange?: (value: string) => void
	isItalicPlaceholder?: boolean
}

export default function CustomTextarea(
		{
			placeholder,
			className,
			value,
			onChange,
			isItalicPlaceholder
		}: ICustomTextarea
) {
	return (
			<AutosizeTextarea
				value={value}
				onChange={(event) => {
					onChange && onChange(event.target.value)
				}}
				placeholder={placeholder}
				className={cn('!min-h-[173px] text-charcoal text-base py-3 px-4 bg-white border border-soft-gray placeholder:text-sm font-medium placeholder:text-charcoal/50 rounded-[12px] focus:border-steel-blue/20 focus:shadow-[0px_0px_16px_0px_#3F72AF1A]',className, isItalicPlaceholder && 'placeholder:italic')}
			/>
	)
}
