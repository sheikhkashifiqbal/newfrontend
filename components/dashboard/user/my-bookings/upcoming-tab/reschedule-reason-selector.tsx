'use client'
import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface IRescheduleReasonSelector{
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void;
	value?: string;
}

export function RescheduleReasonSelector({
																			 placeholder = 'Please select the one that applies',
																			 triggerClassname,
																			 onChange,
																			 value,
																		 }: IRescheduleReasonSelector) {

	const reasons = [
		{
			id: 0,
			value: 'had another work',
			text: 'had another work to do'
		},
		{
			id: 1,
			value: 'idk',
			text: 'I don not know'
		},
		{
			id: 2,
			value: 'no time',
			text: 'No time!'
		},
	]
	return (
			<CustomSelect value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn(triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{reasons.map((C) => {
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
