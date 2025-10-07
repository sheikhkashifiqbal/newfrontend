'use client'
import ServiceCenterCard from "@/components/services/service-center-card";
import {memo, useCallback, useEffect, useMemo, useRef, useState} from "react";
import * as React from "react";
import ServiceCardModal from "@/components/services/service-card-modal";
import ServicesCardsContainer from "@/components/services/services-cards-container";


function ServicesCards() {
	// const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCardId, setSelectedCardId] = useState<number | null>(null);



	const cardReserveBtnClickHandler = useCallback((id: number) => {
		setSelectedCardId(id);
	}, []);


	const handleModalClose = useCallback(() => {
		setSelectedCardId(null);
	}, []);

	return (
			<div
					// style={ H !== 0 ? { height: `${H}px` } : {}} // Set dynamic height
					className={'flex flex-col gap-y-8'}>
				<h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>
					Reliable Car Workshops You Can Trust!
				</h1>
				<p className={'text-base text-charcoal max-w-[80ch]'}>
					Discover seamless car maintenance with our trusted service providers. We’ve partnered with the best car service and repair companies for convenient, reliable, and comprehensive solutions. From routine servicing to emergency repairs and performance upgrades, our platform connects you to certified professionals for quality and safety. Simplify car care with our single, easy-to-use platform.
				</p>
				<ServicesCardsContainer cardReserveBtnClickHandler={cardReserveBtnClickHandler}/>
				<ServiceCardModal selectedCardId={selectedCardId} closeModal={handleModalClose}  />
			</div>
	)
}
export default memo(ServicesCards)
