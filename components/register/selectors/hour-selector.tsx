import {useState} from "react";
import CustomSelect, {CustomSelectItem} from "@/components/app-custom/custom-select";
import {cn} from "@/lib/utils";
import {SelectGroup} from "@/components/ui/select";

interface IHourSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
	value?: string
	iconClassname?: string
}


export function HourSelector({
																 placeholder = 'From',
																 triggerClassname,
																 onChange,
																	value,
																	iconClassname
															 }: IHourSelector) {
	const hours = [
		{
			id: 0,
			value: '09:00',
			text: '09:00'
		},
		{
			id: 1,
			value: '10:00',
			text: '10:00'
		},
		{
			id: 2,
			value: '11:00',
			text: '11:00'
		},
		{
			id: 3,
			value: '12:00',
			text: '12:00'
		},
		{
			id: 4,
			value: '13:00',
			text: '13:00'
		},
		{
			id: 5,
			value: '14:00',
			text: '14:00'
		},
		{
			id: 6,
			value: '15:00',
			text: '15:00'
		},
		{
			id: 7,
			value: '16:00',
			text: '16:00'
		},
		{
			id: 8,
			value: '17:00',
			text: '17:00'
		},
		{
			id: 9,
			value: '18:00',
			text: '18:00'
		},
	]
	return (
			<CustomSelect iconClassname={iconClassname} value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn(triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{/*<CustomSelectLabel>Car services</CustomSelectLabel>*/}
						{hours.map((C) => {
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
