"use client"
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import CustomInput from "@/components/app-custom/custom-input";
import {cn} from "@/lib/utils";
import {DatePicker} from "@/components/app-custom/date-picker";
import CustomTextarea from "@/components/app-custom/custom-textarea";


export interface ICustomFormField {
	control: any
	name: string
	label?: string
	rightMostLabel?: ReactNode
	placeholder?: string
	description?: string
	labelClassname?: string
	inputType?: HTMLInputTypeAttribute
	isItalicPlaceholder?: boolean
}

function CustomFormFieldTextarea(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			placeholder = "placeholder",
			description,
			labelClassname,
			inputType,
			isItalicPlaceholder = false,
		}: ICustomFormField
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
										<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname, !label && 'hidden')}>{label}</FormLabel>
								)}
								<FormControl>
									<CustomTextarea
											className={cn(fieldState.error && '!border-vibrant-red')}
											isItalicPlaceholder={isItalicPlaceholder}
											placeholder={placeholder}
											{...field}
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


export default memo(CustomFormFieldTextarea)
