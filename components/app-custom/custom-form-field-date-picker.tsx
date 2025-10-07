'use client'
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import CustomInput from "@/components/app-custom/custom-input";
import {ICustomFormField} from "@/components/app-custom/CustomFormField";
import {DatePicker} from "@/components/app-custom/date-picker";

type CustomFormFieldDatePickerT = Omit<ICustomFormField, 'inputType'>

function CustomFormFieldDatePicker(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			placeholder,
			description,
			labelClassname,
			isItalicPlaceholder = false,
		}: CustomFormFieldDatePickerT
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
									<DatePicker
											buttonClassname={cn('h-14',fieldState.error && '!border-vibrant-red')}
											date={field.value}
											setDate={(date) => field.onChange(date)}
											placeholder={placeholder}
											isItalicPlaceholder={isItalicPlaceholder}
									/>
								</FormControl>
								{description && (
										<FormDescription>{description}</FormDescription>
								)}
								<FormMessage />
							</FormItem>
					)}
			/>
	)
}


export default memo(CustomFormFieldDatePicker)
