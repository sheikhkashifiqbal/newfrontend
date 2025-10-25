'use client'




import {Dialog, DialogTitle, DialogHeader, DialogContent} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {CarSelector} from "@/components/services/selectors/car-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {CarModelSelector} from "@/components/services/selectors/car-model-selector";
import {ServiceSelector} from "@/components/services/selectors/service-selector";
import {addDays, format} from "date-fns";
import {useEffect} from "react";


interface IProfileServiceReservationPopup {
	serviceId?: number | null;
	closePopup: () => void;
}

interface IServiceCardModalDateSelector {
	form: any;
	dateLive?: string;
	timeLive?: string;
}

function ServiceCardModalDateSelector(
		{
				form,
				dateLive
		}: IServiceCardModalDateSelector
) {
	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => ({
		fullDate: format(addDays(today, i), 'dd MMM yyy'),
		day:format(addDays(today, i), 'dd MMM')
	}));

	useEffect(() => {
		form.setValue('date',next7Days[0].fullDate);
	}, [])
	return (
			<div className={'flex flex-col gap-y-3'}>
				<h5 className={'text-dark-gray text-sm font-medium'}>Reservation Date</h5>
				<div className={'w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4'}>
					{next7Days.map((day) => {
						return (
								<div onClick={() => form.setValue('date',day.fullDate)} key={day.day} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', day.fullDate === dateLive && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
									{day.day}
								</div>
						)
					})}
				</div>
			</div>
	)
}




function ServiceCardModalTimeSelector(
		{
				form,
				timeLive
		}: IServiceCardModalDateSelector
) {
	const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
		"12:00 PM", "12:300 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM"]

	function setTime(time: string) {
		form.setValue('time', time);
	}

	useEffect(() => {
		form.setValue('time', times[0]);
	},[]);


	return (
			<div className={'flex flex-col gap-y-3'}>
				<h5 className={'text-dark-gray text-sm font-medium'}>Reservation time</h5>
				<div className={'grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2'}>
					{times.map((time) => {
						return (
								<div onClick={() => setTime(time)} key={time} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', time === timeLive && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
									{time}
								</div>
						)
					})}
				</div>
			</div>
	)
}



export default function ProfileServiceReservationPopup(
		{
				serviceId,
				closePopup
		}: IProfileServiceReservationPopup
) {


	const reservationFormSchema = z.object({
		brand: z.string({required_error: 'brand is required'}),
		model: z.string({required_error: 'model is required'}),
		service: z.string({required_error: 'service is required'}),
		date: z.string({required_error: 'date is required'}),
		time: z.string({required_error: 'time is required'})
	})


	const form = useForm<z.infer<typeof reservationFormSchema>>({
		resolver: zodResolver(reservationFormSchema),
		mode: 'onChange'
	})

	function onSubmit(values: z.infer<typeof reservationFormSchema>) {
		console.log(values)
	}

	const dateLive = form.watch('date')
	const timeLive = form.watch('time')

	return (
			<Dialog open={!!serviceId}>
				<DialogContent className={cn("overflow-hidden max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
						<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
							Make the reservation
						</DialogTitle>
						<DialogPrimitive.Close onClick={() => {
							closePopup()
							setTimeout(() => {
								form.reset()
							},300)
						}}>
							<X className={'size-6 text-charcoal/50'}/>
						</DialogPrimitive.Close>
					</DialogHeader>

					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 flex flex-col gap-y-8'}>
							<div className={'grid grid-cols-3 gap-6'}>
								<CustomFormFieldSelector
									name={'brand'}
									control={form.control}
									label={'Car brand *'}
									Children={(onChange, hasError, value) => {
										return (
												<CarSelector
													value={value}
													onChange={onChange}
													triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
												/>
										)
									}}
								/>

								<CustomFormFieldSelector
										name={'model'}
										control={form.control}
										label={'Brand model *'}
										Children={(onChange, hasError, value) => {
											return (
													<CarModelSelector
															value={value}
															onChange={onChange}
															brandId={0}
															triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
													/>
											)
										}}
								/>

								<CustomFormFieldSelector
										name={'service'}
										control={form.control}
										label={'Service'}
										Children={(onChange, hasError, value) => {
											return (
													<ServiceSelector
															value={value}
															onChange={onChange}
															triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
													/>
											)
										}}
								/>
							</div>
							<ServiceCardModalDateSelector form={form} dateLive={dateLive}/>
							<ServiceCardModalTimeSelector form={form} timeLive={timeLive}/>
							<CustomBlueBtn className={'w-full'} text={'Make reservation'}/>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
	)
}
