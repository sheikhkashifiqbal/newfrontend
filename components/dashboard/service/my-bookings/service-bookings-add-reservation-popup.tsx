'use client'


import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {z} from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldPhoneInput from "@/components/app-custom/custom-form-field-phone-input";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {CarSelector} from "@/components/services/selectors/car-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {CarModelSelector} from "@/components/services/selectors/car-model-selector";
import {ServiceSelector} from "@/components/services/selectors/service-selector";
import {addDays, format} from "date-fns";
import {useEffect} from "react";

interface IServiceBookingsAddReservationPopup {
	selectedDateAndTime?: {
		date: string;
		time: string;
	} | null
	closePopup: () => void
}

export default function ServiceBookingsAddReservationPopup(
		{
				selectedDateAndTime,
				closePopup
		}: IServiceBookingsAddReservationPopup
) {




	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => ({
		fullDate: format(addDays(today, i), 'dd MMM yyy'),
		day:format(addDays(today, i), 'dd MMM')
	}));

	const times = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
		"12:00", "12:30", "13:00", "13:30", "14:00", "14:30"]

	const serviceAddReservationFormSchema = z.object({
		phone: z.string({required_error: 'phone is required'}).refine(isValidPhoneNumber, {message: "Invalid phone number"}),
		brand: z.string({required_error: 'car brand is required'}),
		model: z.string({required_error: 'brand model is required'}),
		service: z.string({required_error: 'service is required'}),
		date: z.string({required_error: 'date is required'}),
		time: z.string({required_error: 'time is required'})
	})

	const form = useForm<z.infer<typeof serviceAddReservationFormSchema>>({
		resolver: zodResolver(serviceAddReservationFormSchema),
		defaultValues: {
		},
		mode: 'onChange'
	})


	const dateLive = form.watch('date')
	const timeLive = form.watch('time')

	useEffect(() => {
		if(selectedDateAndTime) {
			form.setValue('date', selectedDateAndTime?.date)
			form.setValue('time', selectedDateAndTime?.time)
		}
	}, [selectedDateAndTime]);



	function onSubmit(values: z.infer<typeof serviceAddReservationFormSchema>) {
		console.log(values)
	}

	return (
			<Dialog open={!!selectedDateAndTime}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[600px]'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									Add the reservation
								</DialogTitle>
								<DialogPrimitive.Close onClick={() => {
									closePopup()
									setTimeout(() => {
										form.reset()
									},300)
								}}>
									<X className={'size-6 text-charcoal/50'}/>
								</DialogPrimitive.Close>
							</div>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className={'pt-8 px-8 flex flex-col gap-y-8'}>
								{/*<PhoneInput />*/}
								<CustomFormFieldPhoneInput
										label={'User’s mobile number *'}
										name={'phone'}
										control={form.control}
								/>

								<div className={'grid grid-cols-1 530:grid-cols-3 gap-6'}>
									<CustomFormFieldSelector
										label={'Car brand*'}
										control={form.control}
										name={'brand'}
										Children={
										(onChange, hasError, value) =>
												<CarSelector
														value={value}
														onChange={onChange}
														triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														showMyCars={false}
												/>
									}
									/>

									<CustomFormFieldSelector
											label={'Brand model*'}
											control={form.control}
											name={'model'}
											Children={
												(onChange, hasError, value) =>
														<CarModelSelector
																value={value}
																onChange={onChange}
																brandId={0}
																triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														/>
											}
									/>

									<CustomFormFieldSelector
											label={'Service'}
											control={form.control}
											name={'service'}
											Children={
												(onChange, hasError, value) =>
														<ServiceSelector
																value={value}
																onChange={onChange}
																triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														/>
											}
									/>
								</div>


								{/*Date selections*/}
								<div className={'flex flex-col gap-y-3'}>
									<h5 className={'text-dark-gray text-sm font-medium'}>Updated reservation Date</h5>
									<div className={'w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4'}>
										{next7Days.map((day) => {
											return (
													<div onClick={() => form.setValue("date", day.fullDate)} key={day.day} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', day.day === dateLive && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
														{day.day}
													</div>
											)
										})}
									</div>
								</div>

								{/*Time(Hour) selector*/}
								<div className={'flex flex-col gap-y-3'}>
									<h5 className={'text-dark-gray text-sm font-medium'}>Updated reservation time</h5>
									<div className={'grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2'}>
										{times.map((time) => {
											return (
													<div onClick={() => form.setValue("time", time)} key={time} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', time === timeLive && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
														{time}
													</div>
											)
										})}
									</div>
								</div>


							</form>
						</Form>
					</ScrollArea>
				</DialogContent>
			</Dialog>
	)
}
