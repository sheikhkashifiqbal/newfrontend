'use client'

import {MultiSelect} from "@/components/ui/multi-select";
import {useState} from "react";
import {cn} from "@/lib/utils";

export interface ICustomMultiSelect {
	placeholder?: string
	data?:  {value: string, label: string}[]
	onChange?: (value: string[]) => void
	value?: string[]
	className?: string
}

export default function CustomMultiSelect({
		placeholder = 'Select options',
		data,
		onChange,
		className,
		value
																					}: ICustomMultiSelect) {
	data = data ||  [
		{ value: "react", label: "React"},
		{ value: "angular", label: "Angular" },
		{ value: "vue", label: "Vue" },
		{ value: "svelte", label: "Svelte"},
		{ value: "ember", label: "Ember" },
	];
	return (
			<MultiSelect
					className={cn('py-3 px-4 bg-white border rounded-[12px] border-soft-gray', className)}
					options={data}
					onValueChange={(value) => {
						onChange && onChange(value)
					}}
					defaultValue={value}
					maxCount={1}
					placeholder={placeholder}
			/>
	)
}
