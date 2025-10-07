'use client'


import {CarIcon} from "lucide-react";

interface IProfileOfferCard {
	brand: string;
	offers: string[]
}

export default function ProfileOfferCard(
		{
				brand,
				offers
		}: IProfileOfferCard
) {
	return (
			<div className={'bg-white p-6 rounded-3xl flex flex-col gap-y-6'}>
				<div className={'flex items-center gap-x-4'}>
					<CarIcon className={'size-8'}/>
					<h5 className={'text-charcoal font-semibold text-xl'}>{brand}</h5>
				</div>
				<div className={'flex flex-wrap gap-2'}>
					{offers.map((offer) => {
						return (
								<div className={'flex border max-w-fit border-soft-gray px-4 items-center justify-center rounded-[52px] h-8'} key={offer}>
									{offer}
								</div>
						)
					})}
				</div>
			</div>
	)
}
