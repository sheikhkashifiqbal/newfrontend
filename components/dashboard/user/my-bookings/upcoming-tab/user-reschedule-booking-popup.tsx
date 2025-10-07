'use client'


import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import {SelectionProvider} from "@/hooks/services/useSelection";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {addDays, format} from "date-fns";
import {useEffect, useState} from "react";
import {z} from "zod";
import {useForm, useWatch} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {
	RescheduleReasonSelector
} from "@/components/dashboard/user/my-bookings/upcoming-tab/reschedule-reason-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {Form} from "@/components/ui/form";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";


interface IUserRescheduleBookingPopup {
	rescheduledId: number | null;
	closePopup: () => void;
}



export default function UserRescheduleBookingPopup(
		{
				rescheduledId,
				closePopup
		}: IUserRescheduleBookingPopup
) {
	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => ({
		fullDate: format(addDays(today, i), 'dd MMM yyy'),
		day:format(addDays(today, i), 'dd MMM')
	}));

	const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
		"12:00 PM", "12:30 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM"]

	const userRescheduleBookingPopupFormSchema = z.object({
		selectedDate: z.string(),
		selectedTime: z.string(),
		reason: z.string({required_error: 'please select a reason'})
	})

	const form = useForm<z.infer<typeof userRescheduleBookingPopupFormSchema>>({
		resolver: zodResolver(userRescheduleBookingPopupFormSchema),
		mode: 'onChange',
		defaultValues: {
			selectedDate: next7Days[0].fullDate,
			selectedTime: times[0],
			reason: undefined
		}
	})

	const selectedDate = form.watch('selectedDate');
	const selectedTime = form.watch('selectedTime');

	function onSubmit(values: z.infer<typeof userRescheduleBookingPopupFormSchema>) {
		console.log(values)
	}

	return (
			<Dialog open={rescheduledId !== null}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
						<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
							Reschedule your reservation
						</DialogTitle>
						<DialogPrimitive.Close onClick={() => {
							closePopup();
							setTimeout(() => {
								form.reset()
							}, 300)
						}}>
							<X className={'size-6 text-charcoal/50'}/>
						</DialogPrimitive.Close>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 flex flex-col gap-y-8'}>

							{/*Date selections*/}
							<div className={'flex flex-col gap-y-3'}>
								<h5 className={'text-dark-gray text-sm font-medium'}>Updated reservation Date</h5>
								<div className={'w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4'}>
									{next7Days.map((day) => {
										return (
												<div onClick={() => form.setValue("selectedDate", day.fullDate)} key={day.day} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', day.fullDate === selectedDate && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
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
												<div onClick={() => form.setValue("selectedTime", time)} key={time} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', time === selectedTime && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
													{time}
												</div>
										)
									})}
								</div>
							</div>

							{/*	Reason selector*/}
							<CustomFormFieldSelector
									name={'reason'}
									control={form.control}
									label={'What is reason for your rescheduling?'}
									Children={(onChange, hasError, value) => <RescheduleReasonSelector triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')} value={value} onChange={onChange} />}
							/>

							<CustomBlueBtn type={'submit'} text={'Reschedule'}/>
						</form>
					</Form>

				</DialogContent>
			</Dialog>
	)
}
