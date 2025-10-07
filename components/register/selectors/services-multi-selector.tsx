'use client'


import CustomMultiSelect, {ICustomMultiSelect} from "@/components/app-custom/custom-multi-select";


type IServicesMultiSelector = Omit<ICustomMultiSelect, 'placeholder' | 'data'>

// data?:  {value: string, label: string}[]

export default function ServicesMultiSelector(
		{
				onChange,
				className
		}: IServicesMultiSelector
) {
	const data = [
		{
			value: "engine",
			label: "Engine"
		},
		{
			value: "battery",
			label: "Battery"
		},
		{
			value: "electronics",
			label: "Electronics"
		},
		{
			value: "brake",
			label: "Brake"
		},
		{
			value: "tire",
			label: "Tire"
		},
		{
			value: "diagnostics",
			label: "Diagnostics"
		},
	]
	return (
			<CustomMultiSelect
				className={className}
				data={data}
				onChange={onChange}
				placeholder={'Select the service'}
			/>
	)
}
