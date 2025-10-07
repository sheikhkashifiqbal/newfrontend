import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface ICarPartSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
	value?: string
}


export function CarPartSelector({
																	placeholder = 'Car part',
																	triggerClassname,
																	onChange,
																	value
																}: ICarPartSelector) {
	const services = [
		{
			id: 0,
			value: 'engine',
			text: 'Engine'
		},
		{
			id: 1,
			value: 'air-filter',
			text: 'Air filter'
		},
		{
			id: 2,
			value: 'battery',
			text: 'Battery'
		},
		{
			id: 3,
			value: 'brake',
			text: 'Brake'
		},
		{
			id: 4,
			value: 'tire',
			text: 'Tire'
		}
	]
	return (
			<CustomSelect value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn('bg-soft-gray text-sm font-medium text-dark-gray',triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{services.map((C) => {
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
