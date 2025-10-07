'use client'

import {JSX, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {ICustomFormField} from "@/components/app-custom/CustomFormField";

type Type = Omit<ICustomFormField, 'inputType'>

type ICustomFormFieldSelector = Type & {
	Children: (onChange: (value: any) => void, hasError: boolean, value?: any) => JSX.Element;
};
type Props = {
  form: any;                 // your existing type
  type?: "store" | "service" // existing
  // ⬅️ ADDED:
  services?: string[];
  brands?: string[];
  loadingLists?: boolean;
};

function CustomFormFieldSelector(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			description,
			labelClassname,
			Children,
				className
		}: ICustomFormFieldSelector
) {
	return (
			<FormField
					control={control}
					name={name}
					render={({ field, fieldState }) => {
						// console.log(fieldState.error)
						return (
								(
										<FormItem className={className}>
											{rightMostLabel ? (
													<div className={'flex items-center justify-between'}>
														<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
														{rightMostLabel}
													</div>
											) : (
													<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname, !label && 'hidden')}>{label}</FormLabel>
											)}
											<FormControl>
												{Children(value => field.onChange(value), !!fieldState.error, field.value)}
											</FormControl>
											{description && (
													<FormDescription>{description}</FormDescription>
											)}
											<FormMessage>{fieldState.error?.message}</FormMessage>
										</FormItem>
								)
						)
					}}
			/>
	)
}


export default CustomFormFieldSelector
