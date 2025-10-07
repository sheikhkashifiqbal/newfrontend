'use client'

import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldTextarea from "@/components/app-custom/custom-form-field-textarea";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";
import {
	UserBookingCompleted
} from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab-columns";
import { Rating } from 'react-simple-star-rating'
import {
	UserSparePartAccepted
} from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers-columns";

interface IUserReviewExperiencePopup {
	reviewedRow: null | UserBookingCompleted | UserSparePartAccepted
	closePopup: () => void
}

export default function UserReviewExperiencePopup(
		{
			reviewedRow,
			closePopup
		}: IUserReviewExperiencePopup
) {

	const userReviewExperiencePopupFormSchema = z.object({
		rate: z.number({required_error: 'please rate'}),
		experience: z.string().optional()
	})




	const form = useForm<z.infer<typeof userReviewExperiencePopupFormSchema>>({
		resolver: zodResolver(userReviewExperiencePopupFormSchema),
	})

	const rateLive = form.watch('rate')


	function onSubmit(values: z.infer<typeof userReviewExperiencePopupFormSchema>) {
		console.log(values)
	}

	const handleRating = (rate: number) => {
		form.setValue('rate', rate)
	}

	return (
			<Dialog open={!!reviewedRow}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[600px]'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									How would you rate your experience?
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
									<h4 className={'text-dark-gray text-base font-medium'}>{reviewedRow?.service}</h4>
								</div>
								<div className={'flex flex-col gap-2'}>
									<p className={'text-misty-gray font-medium text-xs'}>Car & Service type</p>
									<div className={'flex flex-col'}>
										{/*@ts-ignore*/}
										<h4 className={'text-dark-gray text-base font-medium'}>{reviewedRow?.car}</h4>
										{/*@ts-ignore*/}
										<h4 className={'text-dark-gray text-base font-medium'}>{reviewedRow?.serviceType}</h4>
									</div>
								</div>
							</div>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className={'pt-8 px-8 flex flex-col gap-y-8'}>

								<div className={'flex flex-col gap-y-3'}>
									<h4 className={'text-dark-gray text-base font-medium'}>In a 5 star rate what was your experience?</h4>
									<Rating
											allowFraction={false}
											transition={true}
											onClick={handleRating}
											SVGclassName={`inline-block`}
											emptyColor={'#E9ECEF'}
											allowHover={false}
									/>
								</div>

								<CustomFormFieldTextarea
										name={'experience'}
										control={form.control}
										label={''}
										placeholder={'Anything else that you’d like to share  about your experience?'}
								/>

								<CustomBlueBtn className={'mt-4'} type={'submit'} text={'Submit'}/>
							</form>
						</Form>

					</ScrollArea>

				</DialogContent>
			</Dialog>
	)
}
