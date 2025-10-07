'use client'


import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import ProfileServiceReservationPopup from "@/components/profile/service/profile-service-reservation-popup";
import {useState} from "react";

interface ISendOfferButton {
	type: 'service' | 'store'
	id?: number | null
}

export default function ProfileSendOfferButton(
		{
				type = 'service',
				id = 1
		}: ISendOfferButton
) {

	const [ID, setID] = useState<number | null>(null)

	return (
			<>
				<CustomBlueBtn onClick={() => setID(id)} className={'py-3 px-6 h-10'} text={type === 'service' ? 'Make Reservation' : 'Send Request'} />
				{type === "service" && <ProfileServiceReservationPopup serviceId={ID} closePopup={() => setID(null)} />}
			</>
	)
}
