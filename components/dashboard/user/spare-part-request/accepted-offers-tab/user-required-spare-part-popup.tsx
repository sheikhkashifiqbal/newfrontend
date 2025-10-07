'use client'



import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {
	UserSparePartAccepted
} from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers-columns";
import CustomInput from "@/components/app-custom/custom-input";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import PhoneIcon from '@/assets/icons/support/PhoneIcon.svg'
import {
	UserSparePartAcceptedReq
} from "@/components/dashboard/user/spare-part-request/accepted-requests-tab/user-required-spare-part-accepted-requests-columns";
import {Button} from "@/components/ui/button";

interface IUserRequiredSparePartPopup {
	viewedRow: UserSparePartAccepted | UserSparePartAcceptedReq | null
	closePopup: () => void
	actions?: boolean
}


function SingleRow() {
	return (
			<div className={'items-center gap-x-4 flex'}>
				<div className={'flex flex-col gap-y-3 basis-[50%]'}>
					<h4 className={'text-dark-gray text-sm font-medium'}>Part name</h4>
					<CustomInput className={'text-sm'} value={'#1 Engine Block'} />
				</div>

				<div className={'flex flex-col gap-y-3 basis-[30%]'}>
					<h4 className={'text-dark-gray text-sm font-medium'}>Class</h4>
					<CustomInput className={'text-sm'} value={'A-class'} />
				</div>

				<div className={'flex flex-col gap-y-3 basis-[11%]'}>
					<h4 className={'text-dark-gray text-sm font-medium'}>Qty</h4>
					<CustomInput className={'text-sm text-center px-0'} value={'1'} />
				</div>

				<div className={'flex flex-col gap-y-3 basis-[9%]'}>
					<h4 className={'text-dark-gray text-sm font-medium'}>Price</h4>
					<CustomInput className={'text-sm text-center px-0'} value={'150'} />
				</div>
			</div>
	)
}


export default function UserRequiredSparePartPopup(
		{
				viewedRow,
				closePopup,
				actions = false
		}: IUserRequiredSparePartPopup
) {
	return (
			<Dialog open={!!viewedRow}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] md:max-w-[700px] lg:max-w-[650px] max-h-[450px] 650:max-h-[550px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[550px]'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									Required spare part
								</DialogTitle>
								<DialogPrimitive.Close onClick={() => {
										closePopup()
								}}>
									<X className={'size-6 text-charcoal/50'}/>
								</DialogPrimitive.Close>
							</div>

							<h5 className={'text-base text-charcoal'}>
								For <span className={'text-steel-blue'}>{viewedRow?.state} {viewedRow?.carPart} Parts</span> of VIN <span className={'text-steel-blue'}>{viewedRow?.vin}</span>
							</h5>
						</DialogHeader>

						<div className={'flex flex-col gap-y-4 px-8 pt-8'}>
							<div className={'text-dark-gray text-sm font-medium rounded-[8px] bg-ice-mist border border-soft-sky py-2 px-4 max-w-20'}>
								Engine
							</div>

							{Array.from({length: 3}).map((_, index) => {
								return (
										<SingleRow key={index} />
								)
							})}

							{actions ? (
									<div className={'flex items-center gap-x-4 justify-center'}>
											<CustomBlueBtn text={"Accept"}/>
											<Button className={'text-coral-blush bg-inherit py-2 px-4'}>
												Decline
											</Button>
									</div>
							) : (
									<CustomBlueBtn show={"children"}>
										<PhoneIcon className={'!size-5 text-white'} />
										<span>+994 55 995 47 65</span>
									</CustomBlueBtn>
							)}

						</div>
					</ScrollArea>
				</DialogContent>
			</Dialog>
	)
}
