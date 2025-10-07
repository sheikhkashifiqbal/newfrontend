'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import CustomCheckbox from "@/components/app-custom/custom-checkbox";
import {CustomSwitch} from "@/components/app-custom/custom-switch";
import {cn} from "@/lib/utils";
import {Form} from "@/components/ui/form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {HourSelector} from "@/components/register/selectors/hour-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { parse, isBefore } from 'date-fns';


interface ICustomHourSelector {
	placeholder: 'From' | 'To'
	value: string;
	hasError: boolean;
	onChange: (value: string) => void;
	index?: number;
	field: any
}

function CustomHourSelector({
		placeholder,
		value,
		hasError,
		onChange,
		index,
		field
														}: ICustomHourSelector) {
	return (
			<HourSelector
					placeholder={placeholder}
					triggerClassname={cn(grayTriggerClassname,'h-12 w-32',!field.open && '!text-misty-gray', hasError && '!border-vibrant-red')}
					value={value}
					onChange={onChange}
					iconClassname={cn(!field.open && 'text-misty-gray')}
			/>
	)
}

export default function ServiceWorkScheduleTab() {


	const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

	const daySchema = z.object({
		open: z.boolean(),
		from: z.string(),
		to: z.string()
	}).superRefine((data, ctx) => {
		if (data.from && data.to) {
			const timeFromDate = parse(data.from, "HH:mm", new Date());
			const timeToDate = parse(data.to, "HH:mm", new Date());
			if(data.from === data.to || isBefore(timeToDate, timeFromDate)) {
				console.log('error')
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: "'To' time must be later than 'From' time",
					path: ["to"],
				});
			}
		}
	});

	const serviceWorkScheduleForm = z.object({
		days: z.array(daySchema).length(7)
	})


	const form = useForm<z.infer<typeof serviceWorkScheduleForm>>({
		resolver: zodResolver(serviceWorkScheduleForm),
		defaultValues: {
			days: Array(7).fill({ open: false, from: "", to: "" }),
		},
		mode: 'onChange',
		reValidateMode: 'onChange',
	})



	const fields = form.watch('days')

	return (
			<DashboardContainer>
				<Form {...form}>
					<form className={'flex flex-col gap-y-4'}>
						<h5 className={'text-dark-gray text-sm font-medium'}>Working days</h5>

						<div className={'grid grid-cols-1 500:grid-cols-2 900:grid-cols-3 xl:grid-cols-4 gap-4'}>
							{fields.map((field, index) => {
								return (
										<div className={'bg-white rounded-2xl flex flex-col gap-y-2 p-6'} key={weekDays[index]}>
											<CustomSwitch
													checked={field.open}
													onChecked={(checked) => form.setValue(`days.${index}.open`, checked)}
													label={weekDays[index]}
													id={weekDays[index]}
													labelClassname={cn('text-base text-misty-gray', field.open && 'text-dark-gray')}
											/>

											{["From", "To"].map((val, key) => {
												return (
														<div key={val} className={'w-full flex items-center gap-2'}>
															<h5 className={cn('w-[4ch] text-sm font-medium text-misty-gray', field.open && 'text-dark-gray')}>{val}</h5>
															<CustomFormFieldSelector
																	className={'w-full'}
																	name={val === "From" ? `days.${index}.from` : `days.${index}.to`}
																	control={form.control}
																	label={''}
																	labelClassname={cn(!field.open && 'text-misty-gray')}
																	Children={(onChange, hasError, value) =>
																			<CustomHourSelector
																					placeholder={val as "From" | "To"}
																					value={value}
																					onChange={(value) => {
																						onChange(value)
																					}}
																					hasError={hasError}
																					field={field}
																			/>
																	}
															/>
														</div>
												)
											})}
										</div>
								)
							})}
						</div>

						<CustomBlueBtn className={'max-w-fit'} text={"Save changes"}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
