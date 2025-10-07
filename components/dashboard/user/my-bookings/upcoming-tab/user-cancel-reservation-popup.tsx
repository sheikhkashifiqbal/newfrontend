'use client'

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {
	UserBookingUpcoming
} from "@/components/dashboard/user/my-bookings/upcoming-tab/user-bookings-upcoming-tab-columns";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {CancelReasonSelector} from "@/components/dashboard/user/my-bookings/upcoming-tab/cancel-reason-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import CustomFormFieldTextarea from "@/components/app-custom/custom-form-field-textarea";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";


interface IUserCancelReservationPopup {
	cancelledRow: null | UserBookingUpcoming
	closePopup: () => void
}

export default function UserCancelReservationPopup(
		{
				cancelledRow,
				closePopup
		}: IUserCancelReservationPopup
) {

	const userCancelReservationPopupFormSchema = z.object({
		reason: z.string({required_error: 'please select a reason'}),
		detailedReason: z.string().optional()
	})


	const form = useForm<z.infer<typeof userCancelReservationPopupFormSchema>>({
		resolver: zodResolver(userCancelReservationPopupFormSchema),
	})

	function onSubmit(values: z.infer<typeof userCancelReservationPopupFormSchema>) {
		console.log(values)
	}


	return (
			<Dialog open={!!cancelledRow}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-full'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									Do you want to cancel your reservation?
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

							<div className={'flex items-center justify-between gap-5'}>
								<div className={'flex flex-col gap-2'}>
									<p className={'text-misty-gray font-medium text-xs'}>Service & Location</p>
									<h4 className={'text-dark-gray text-base font-medium'}>{cancelledRow?.service}</h4>
								</div>
								<div className={'flex flex-col gap-2'}>
									<p className={'text-misty-gray font-medium text-xs'}>Car & Service type</p>
									<div className={'flex flex-col'}>
										<h4 className={'text-dark-gray text-base font-medium'}>{cancelledRow?.car}</h4>
										<h4 className={'text-dark-gray text-base font-medium'}>{cancelledRow?.serviceType}</h4>
									</div>
								</div>
							</div>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 flex flex-col gap-y-2'}>
								<CustomFormFieldSelector
										name={'reason'}
										label={'What is reason for your cancellation'}
										control={form.control}
										Children={(onChange, hasError, value) => <CancelReasonSelector triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')} value={value} onChange={onChange}/>}
								/>

								<CustomFormFieldTextarea
										name={'detailedReason'}
										control={form.control}
										label={''}
										placeholder={'Type out detailed reason of your cancellation'}
								/>

								<CustomBlueBtn className={'mt-4'} type={'submit'} text={'Submit'}/>
							</form>
						</Form>

						<ScrollBar />
					</ScrollArea>

				</DialogContent>
			</Dialog>
	)
}
