import {useState} from "react";
import CustomSelect, {CustomSelectItem} from "@/components/app-custom/custom-select";
import {cn} from "@/lib/utils";
import {SelectGroup} from "@/components/ui/select";

interface IGenderSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
	value?: string
}


export function GenderSelector({
															 placeholder = 'Select gender',
															 triggerClassname,
															 onChange,
															 value
														 }: IGenderSelector) {
	const genders = [
		{
			id: 0,
			value: 'man',
			text: 'Man'
		},
		{
			id: 1,
			value: 'woman',
			text: 'Woman'
		},
		{
			id: 2,
			value: 'others',
			text: 'Others'
		},
	]
	return (
			<CustomSelect value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn(triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{/*<CustomSelectLabel>Car services</CustomSelectLabel>*/}
						{genders.map((C) => {
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
