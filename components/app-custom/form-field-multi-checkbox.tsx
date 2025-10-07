'use client'

import {JSX, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {ICustomFormField} from "@/components/app-custom/CustomFormField";

type Type = Omit<ICustomFormField, 'inputType'>

type ICustomFormFieldMultiCheckbox = Type & {
	Children: (onChange: (value: any) => void, hasError: boolean, value?: any) => JSX.Element;
};

function CustomFormFieldMultiCheckbox(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			description,
			labelClassname,
			Children
		}: ICustomFormFieldMultiCheckbox
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
									{Children(value => field.onChange(value), !!fieldState.error, field.value)}
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


export default memo(CustomFormFieldMultiCheckbox)
