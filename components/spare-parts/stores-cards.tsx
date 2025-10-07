'use client'
import * as React from "react";
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import ServiceCardPhoto from "@/assets/Services/ServiceCardPhoto.png";
import {CardHeader} from "@/components/services/service-center-card";


function PopularCarBrands() {
	const services = ['Porsche', 'Mercedes-Benz', 'BMW', 'Changan', 'Zeekr', 'Fiat'];
	return (
			<div className={'p-8 pt-0 flex flex-col gap-y-3'}>
				<p className={'text-sm font-medium text-muted-gray'}>Popular car brands</p>
				<div className={'flex flex-wrap gap-1'}>
					{services.map((s) => {
						return (
								<div key={s} className={'py-1.5 px-4 rounded-[52px] border-[1px] border-soft-gray text-base text-charcoal font-medium w-fit'}>
									{s}
								</div>
						)
					})}
				</div>
			</div>
	)
}

function SingleStoreCard() {
	return (
			<div className={'flex flex-col max-w-[392px] max-h-[524px] overflow-hidden rounded-3xl bg-white'}>
				<img className={'rounded-t-3xl max-h-[160px] object-cover'} src={ServiceCardPhoto.src} />
				<div className={'flex flex-col gap-6'}>
					<CardHeader containerClassname={'p-8 pb-0'}/>
					<PopularCarBrands />
				</div>
			</div>
	)
}

export default function StoresCards() {
	const cards_length = 9;
	return (
			<div className={'flex flex-col gap-y-8'}>
				<h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>
					Reliable Car Spare Part Suppliers You Can Trust!
				</h1>
				<p className={'text-base text-charcoal max-w-[80ch]'}>
					Discover seamless car maintenance with our trusted service providers. We’ve partnered with the best car service and repair companies for convenient, reliable, and comprehensive solutions. From routine servicing to emergency repairs and performance upgrades, our platform connects you to certified professionals for quality and safety. Simplify car care with our single, easy-to-use platform.
				</p>
				<div className={'py-5 grid grid-cols-1 600:grid-cols-2 mx-0 xl:grid-cols-3 1650:grid-cols-4 2060:grid-cols-5 gap-x-5 gap-y-6'}>
					{Array.from({length: cards_length}).map((c, index) => {
						return (
								<SingleStoreCard key={index}/>
						)
					})}
				</div>
			</div>
	)
}
