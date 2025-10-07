'use client'

import PenIcon from "@/assets/icons/dashboard/PenIcon.svg";
import XIcon from "@/assets/icons/dashboard/XIcon.svg";
import {UserCarType} from "@/components/dashboard/user/profile-info/car-tab/user-cars-tab";
import {memo} from "react";


interface IUserCar {
	car: UserCarType
	setSelectedCar: (car: UserCarType) => void
	setDeletedCar: (car: UserCarType) => void
}

function UserCar({
		car,
		setSelectedCar,
		setDeletedCar
																}: IUserCar) {
	return (
			<div className={'p-6 rounded-[16px] bg-white flex flex-col gap-1'}>
				<div className={'flex items-center justify-between pb-2'}>
					<h4 className={'text-slate-gray text-base font-medium'}>{car.brand} {car.model}</h4>

					<div className={'flex items-center gap-2'}>
						<div onClick={() => setSelectedCar(car)} className={'cursor-pointer size-5 flex items-center justify-center'}>
							<PenIcon className={'!size-4 text-dark-gray'}/>
						</div>
						<div onClick={() => setDeletedCar(car)} className={'cursor-pointer size-5 flex items-center justify-center'}>
							<XIcon className={'!size-2.5 text-bold-red'} />
						</div>
					</div>
				</div>

				<div className={'flex items-center gap-2'}>
					<h5 className={'text-misty-gray text-sm'}>VIN №:</h5>
					<span className={'text-dark-gray text-base font-medium'}>{car.vin}</span>
				</div>

				<div className={'flex items-center gap-2'}>
					<h5 className={'text-misty-gray text-sm'}>Plate №:</h5>
					<span className={'text-dark-gray text-base font-medium'}>{car.plateNumber}</span>
				</div>
			</div>
	)
}

export default memo(UserCar)
