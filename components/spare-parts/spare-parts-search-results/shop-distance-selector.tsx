import CustomSelect, {CustomSelectItem, CustomSelectLabel} from "@/components/app-custom/custom-select";
import {SelectGroup} from "@/components/ui/select";
import {cn} from "@/lib/utils";
import {useState} from "react";

interface IShopDistanceSelector {
	placeholder?: string
	triggerClassname?: string
	onChange?: (value: string) => void
}


export function ShopDistanceSelector({
																			 placeholder = 'Shop distance',
																			 triggerClassname,
																			 onChange
																		 }: IShopDistanceSelector) {
	const [distance,setDistance] = useState<string | undefined>(undefined)
	const distances = [
		{
			id: 0,
			value: 'all',
			text: 'All'
		},
		{
			id: 1,
			value: 'closest',
			text: 'Closest'
		},
		{
			id: 2,
			value: 'farthest',
			text: 'Farthest'
		},
	]
	return (
			<CustomSelect value={distance} onChange={(value) => {
				setDistance(value)
				onChange && onChange(value)
			}} triggerClassname={cn('bg-soft-gray text-sm font-medium text-dark-gray',triggerClassname)} placeholder={placeholder}>
				<div className={'p-5 flex flex-col gap-y-3'}>
					<SelectGroup>
						{distances.map((C) => {
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
