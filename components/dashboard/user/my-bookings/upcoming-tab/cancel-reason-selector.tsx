'use client'
import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface ICancelReasonSelector{
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void;
	value?: string;
}

export function CancelReasonSelector({
															placeholder = 'Please select the one that applies',
															triggerClassname,
															onChange,
															value,
														}: ICancelReasonSelector) {

	const reasons = [
		{
			id: 0,
			value: 'late',
			text: 'Was late'
		},
		{
			id: 1,
			value: 'idk',
			text: 'I don not know'
		},
		{
			id: 2,
			value: 'slow response',
			text: 'Slow response'
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
