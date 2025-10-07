"use client"
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import CustomInput from "@/components/app-custom/custom-input";
import {cn} from "@/lib/utils";
import {DatePicker} from "@/components/app-custom/date-picker";
import {PhoneInput} from "@/components/ui/phone-input";


export interface ICustomFormFieldPhoneInput {
	control: any
	name: string
	label?: string
	rightMostLabel?: ReactNode
	placeholder?: string
	description?: string
	labelClassname?: string
	found?: boolean
}

function CustomFormFieldPhoneInput(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			description,
			labelClassname,
			found = false,
				placeholder
		}: ICustomFormFieldPhoneInput
) {
	return (
			<FormField
					control={control}
					name={name}
					render={({ field, fieldState }) => (
							<FormItem>
								{rightMostLabel ? (
										<div className={'flex items-center justify-between'}>
											<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
											{rightMostLabel}
										</div>
								) : (
										<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
								)}
								<FormControl>
									<PhoneInput
											placeholder={placeholder}
											found={found}
											className={cn('h-14',fieldState.error && '!border-vibrant-red')}
											{...field}
											onChange={(value) => field.onChange(value)}
											value={field.value ?? ""}
									/>
								</FormControl>
								{description && (
										<FormDescription>{description}</FormDescription>
								)}
								<FormMessage className={'text-vibrant-red text-xs'}/>
							</FormItem>
					)}
			/>
	)
}


export default memo(CustomFormFieldPhoneInput)
