'use client'
import {HTMLInputTypeAttribute, memo, ReactNode} from "react";
import {FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {cn} from "@/lib/utils";
import CustomInput from "@/components/app-custom/custom-input";
import {ICustomFormField} from "@/components/app-custom/CustomFormField";
import {DatePicker} from "@/components/app-custom/date-picker";
import FileUpload from "@/components/app-custom/file-upload";

type CustomFormFieldFilePickerT = Omit<ICustomFormField, 'inputType' | 'placeholder' | 'isItalicPlaceholder'>

function CustomFormFieldFile(
		{
			control,
			name,
			label = "label",
			rightMostLabel,
			description,
			labelClassname,
		}: CustomFormFieldFilePickerT
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
									<FileUpload value={field.value} onDrop={(acceptedFile) => field.onChange(acceptedFile)}/>
								</FormControl>
								{description && (
										<FormDescription className={'text-misty-gray text-sm font-normal'}>
											{description}
										</FormDescription>
								)}
								<FormMessage />
							</FormItem>
					)}
			/>
	)
}


export default memo(CustomFormFieldFile)
