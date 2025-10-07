'use client'
import {memo} from "react";
import * as React from "react";
import {CarPartSelector} from "@/components/spare-parts/spare-parts-search-results/car-part-selector";
import {CarPartStateSelector} from "@/components/spare-parts/spare-parts-search-results/car-part-state-selector";
import {ShopDistanceSelector} from "@/components/spare-parts/spare-parts-search-results/shop-distance-selector";
import ServiceLogo from '@/assets/icons/services/ServiceLogo.svg'
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
function SearchResultStoreCard() {
	const infos = [
		{
			type: 'Spare part',
			data: 'Engine'
		},
		{
			type: 'State',
			data: 'All'
		},
		{
			type: 'City',
			data: 'Baku'
		},
		{
			type: 'Distance',
			data: '4.34 km'
		}
	]
	return (
			<div className={'flex gap-6 py-4 px-6 flex-col xl:flex-row rounded-[8px] bg-white'}>
				<div className={'basis-[50%] flex gap-4 items-center'}>
					<img className={'rounded-full size-14'} src={ServiceLogo.src}/>
					<div className={'flex flex-col gap-0.5'}>
						<h4 className={'text-charcoal text-xl font-semibold'}>Performance Center</h4>
						<div className={'flex items-center gap-1'}>
							<img src={YellowStar.src}/>
							<h6 className={'text-charcoal text-sm font-semibold'}>4.5</h6>
						</div>
					</div>
				</div>
				<div className={'flex flex-wrap gap-6 items-center basis-full xl:basis-[50%]'}>
					{/*<div className={'flex gap-6'}>*/}
						{infos.map((info) => {
							return (
									<div key={info.type} className={'w-[96px] flex flex-col'}>
										<h5 className={'text-muted-gray text-sm'}>{info.type}</h5>
										<h5 className={'text-black text-base font-medium'}>{info.data}</h5>
									</div>
							)
						})}
					{/*</div>*/}
					<CustomBlueBtn text={'Request'} className={'h-[40px] bg-white font-semibold border-[1.5px] border-steel-blue text-steel-blue py-3 px-4'}/>
				</div>
			</div>
	)
}

function SparePartsSearchResults() {
	const cards_length = 5;
	return (
			<div className={'flex flex-col gap-y-5'}>
				<h5 className={'text-dark-gray text-sm font-medium'}>Search results</h5>

				<div className={'flex flex-col gap-3'}>
					<h5 className={'text-dark-gray text-sm font-medium'}>Filter by</h5>
					<div className={'max-w-full sm:max-w-[75%] xl:max-w-[50%] grid grid-cols-1 450:grid-cols-3 gap-3'}>
						<CarPartSelector />
						<CarPartStateSelector />
						<ShopDistanceSelector />
					</div>
				</div>
				<div className={'flex flex-col gap-y-4'}>
					{Array.from({length: cards_length}).map((_, index) => {
						return (
								<SearchResultStoreCard key={index}/>
						)
					})}
				</div>
			</div>
	)
}

export default memo(SparePartsSearchResults)
