"use client"
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import CustomInput from "@/components/app-custom/custom-input";
import {cn} from "@/lib/utils";



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
	className?: string
	containerClassname?: string
}

function CustomFormField(
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
				className,
				containerClassname
		}: ICustomFormField
) {
	return (
			<FormField
				control={control}
				name={name}
				render={({ field, fieldState }) => (
						<FormItem className={cn(containerClassname)}>
							{rightMostLabel ? (
									<div className={'flex items-center justify-between'}>
										<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
										{rightMostLabel}
									</div>
							) : (
									<FormLabel className={cn('text-dark-gray font-medium text-sm', labelClassname)}>{label}</FormLabel>
							)}
							<FormControl>
								<CustomInput
										className={cn('h-14',className,fieldState.error && '!border-vibrant-red')}
										isItalicPlaceholder={isItalicPlaceholder}
										inputType={inputType}
										placeholder={placeholder}
										{...field}
										value={field.value ?? ""}
										onChange={(value) => field.onChange(inputType === "number" ? Number(value) : value)}
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


export default CustomFormField
