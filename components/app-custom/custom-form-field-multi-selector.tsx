'use client'

import {JSX, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import {ICustomFormField} from "@/components/app-custom/CustomFormField";

type Type = Omit<ICustomFormField, 'inputType'>

type Props = {
  form: any;                 // your existing type
  type?: "store" | "service" // existing
  // ⬅️ ADDED:
  services?: string[];
  brands?: string[];
  loadingLists?: boolean;
};

type ICustomFormFieldMultiSelector = Type & {
	Children: (onChange: (value: string[]) => void, hasError: boolean, value?: string[]) => JSX.Element;
};

function CustomFormFieldMultiSelector(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			description,
			labelClassname,
			Children
		}: ICustomFormFieldMultiSelector
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


export default memo(CustomFormFieldMultiSelector)
