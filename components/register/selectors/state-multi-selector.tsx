'use client'


import CustomMultiSelect, {ICustomMultiSelect} from "@/components/app-custom/custom-multi-select";


type  BrandsMultiSelector = Omit<ICustomMultiSelect, 'placeholder' | 'data'>

// data?:  {value: string, label: string}[]

export default function StateMultiSelector(
		{
			onChange,
			className,
			value
		}:  BrandsMultiSelector
) {
	const data = [
		{
			value: "new",
			label: "New"
		},
		{
			value: "used",
			label: "Used"
		},
	]
	return (
			<CustomMultiSelect
					value={value}
					className={className}
					data={data}
					onChange={onChange}
					placeholder={'State'}
			/>
	)
}
