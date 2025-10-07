import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface IProfileReviewsFilterSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
	value?: undefined | string
}


export function ProfileReviewsFilterSelector({
																	placeholder = 'Select filter',
																	triggerClassname,
																	onChange,
																	value
																}: IProfileReviewsFilterSelector) {
	// const [service,setService] = useState<string | undefined>(undefined)
	const filters = [
		{
			id: 0,
			value: 'all-stars',
			text: 'All stars'
		},
		{
			id: 1,
			value: '5-star',
			text: '5 star'
		},
		{
			id: 2,
			value: '4-star',
			text: '4 star'
		},
	]
	return (
			<CustomSelect value={value} onChange={(value) => {
				onChange && onChange(value)
			}} triggerClassname={cn(triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{/*<CustomSelectLabel>Car services</CustomSelectLabel>*/}
						{filters.map((C) => {
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
