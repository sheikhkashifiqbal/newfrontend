import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface ICarPartStateSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
	value?: string;
}


export function CarPartStateSelector({
																	placeholder = 'Car part state',
																	triggerClassname,
																	onChange,
		value
																}: ICarPartStateSelector) {
	const states = [
		{
			id: 0,
			value: 'all',
			text: 'All'
		},
		{
			id: 1,
			value: 'old',
			text: 'Old'
		},
		{
			id: 2,
			value: 'new',
			text: 'New'
		},
	]
	return (
			<CustomSelect value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn('bg-soft-gray text-sm font-medium text-dark-gray',triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{states.map((C) => {
							return (
									<CustomSelectItem key={C.id} value={C.value}>
										{C.text}
									</CustomSelectItem>
							)
						})}
					</SelectGroup>
				</div>
			</CustomSelect>
	)
}
