'use client'


import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {UserCarType} from "@/components/dashboard/user/profile-info/car-tab/user-cars-tab";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {memo, useState} from "react";

interface IUserDeleteCarPopup {
	isOpen?: boolean;
	car?: UserCarType | null
	closePopup: () => void
}

function UserDeleteCarPopup({
		isOpen,
		car,
		closePopup
																					 }: IUserDeleteCarPopup) {

	if(!car) return null


	const [canDelete, setCanDelete] = useState(true);

	function onClose() {
		closePopup()
		setTimeout(() => {
			setCanDelete(true)
		}, 250)
	}

	return (
		<Dialog open={isOpen}>
			<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[520px]  max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
				<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
					<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
						Delete Your Vehicle
					</DialogTitle>
					<DialogPrimitive.Close onClick={() => {
						onClose()
					}}>
						<X className={'size-6 text-charcoal/50'}/>
					</DialogPrimitive.Close>
				</DialogHeader>

				<div className={'px-8 flex flex-col gap-y-8'}>


					{canDelete ? (
							<>
								<h3 className={'text-charcoal font-semibold text-xl'}>Be attentive, It can not be undone!</h3>

								<div className={'flex flex-col gap-y-3'}>
									{/*Brand*/}
									<div className={'flex gap-x-1'}>
										<h5 className={'text-base text-charcoal/50'}>Brand:</h5>
										<span className={'text-base text-charcoal font-medium'}>{car.brand}</span>
									</div>

									{/*Model*/}
									<div className={'flex gap-x-1'}>
										<h5 className={'text-base text-charcoal/50'}>Model:</h5>
										<span className={'text-base text-charcoal font-medium'}>{car.model}</span>
									</div>

									{/*VIN*/}
									<div className={'flex gap-x-1'}>
										<h5 className={'text-base text-charcoal/50'}>VIN:</h5>
										<span className={'text-base text-charcoal font-medium'}>{car.vin}</span>
									</div>

									{/*Plate Number*/}
									<div className={'flex gap-x-1'}>
										<h5 className={'text-base text-charcoal/50'}>Plate number:</h5>
										<span className={'text-base text-charcoal font-medium'}>{car.plateNumber}</span>
									</div>
								</div>
							</>
					) : (
							<h4 className={'text-charcoal/50 font-semibold text-xl'}>Can not be deleted! First cancel all existing planned reservations for the vehicle.</h4>
					)}

					<CustomBlueBtn
							onClick={() => {
								if(canDelete) {
									setCanDelete(false)
								} else {
									onClose()
								}
							}}
							text={canDelete ? "Delete" : "Okay"}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
export default memo(UserDeleteCarPopup)
