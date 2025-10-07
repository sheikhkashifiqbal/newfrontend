'use client'

import {Button} from "@/components/ui/button";
import PlusIcon from "@/assets/icons/register/PlusIcon.svg";
import UserCar from "@/components/dashboard/user/profile-info/user-car";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import UserAddEditCarPopup from "@/components/dashboard/user/profile-info/car-tab/user-add-edit-car-popup";
import {useState} from "react";
import UserDeleteCarPopup from "@/components/dashboard/user/profile-info/car-tab/user-delete-car-popup";

const cars = [
	{
		id: 0,
		brand: 'Mercedes-Maybach',
		model: 'S 450',
		vin: '41561246546465465567521',
		plateNumber: '10–AA–100'
	},
	{
		id: 1,
		brand: 'Mercedes-Maybach',
		model: 'S 450',
		vin: '41561246546465465567521',
		plateNumber: '10–AA–100'
	},
	{
		id: 2,
		brand: 'Mercedes-Maybach',
		model: 'S 450',
		vin: '41561246546465465567521',
		plateNumber: '10–AA–100'
	},
	{
		id: 3,
		brand: 'Mercedes-Maybach',
		model: 'S 450',
		vin: '41561246546465465567521',
		plateNumber: '10–AA–100'
	},
]

export type UserCarType = typeof cars[0]


export default function UserCarsTab() {

	//fetched current cars



	const [selectedCar, setSelectedCar] = useState<UserCarType | null>(null)
	const [deletedCar, setDeletedCar] = useState<UserCarType | null>(null);
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	return (
			<DashboardContainer>
				<div className={'flex flex-col gap-y-5'}>

					{/*Add car button*/}
					<div className={'flex gap-12 items-center'}>
						<h5 className={'text-dark-gray font-medium text-sm'}>Cars</h5>
						<Button onClick={() => setIsPopupOpen(true)} className={'flex items-center justify-center gap-2'}>
							<PlusIcon className={'!size-3'}/>
							<span className={'text-misty-gray'}>Add new</span>
						</Button>
					</div>

					{/*	Cars */}

					<div className={'grid grid-cols-1 900:grid-cols-2 gap-6'}>
						{cars.map((car,idx) => {
							return <UserCar setDeletedCar={setDeletedCar} setSelectedCar={setSelectedCar} car={car} key={car.id} />
						})}
					</div>

					<UserAddEditCarPopup
							car={selectedCar}
							isOpen={isPopupOpen || !!selectedCar}
							closePopup={() => {
								setIsPopupOpen(false)
								setSelectedCar(null)
						}}
					/>

					<UserDeleteCarPopup
							isOpen={deletedCar !== null}
							car={deletedCar}
							closePopup={() => {
								setDeletedCar(null)
							}}
					/>
				</div>
			</DashboardContainer>
	)
}
