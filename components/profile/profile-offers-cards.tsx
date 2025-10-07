'use client'



import DashboardContainer from "@/components/dashboard/DashboardContainer";
import ProfileSendOfferButton from "@/components/profile/profile-send-offer-button";
import {CarSelector} from "@/components/services/selectors/car-selector";
import {ServiceSelector} from "@/components/services/selectors/service-selector";
import ProfileOfferCard from "@/components/profile/profile-offer-card";


interface IProfileOffersCards {
	type?: 'service' | 'store'
}

export default function ProfileOffersCards(
		{
				type = 'service',
		}: IProfileOffersCards
) {
	return (
			<DashboardContainer>
				<div className={'flex flex-col gap-y-5'}>
					<div className={'flex flex-col gap-y-5 570:flex-row 570:items-end justify-between'}>
						<div className={'flex flex-col gap-y-3 basis-[60%]'}>
							<h5 className={'text-dark-gray text-sm font-medium'}>Filter by</h5>
							<div className={'grid grid-cols-2 900:grid-cols-3 items-center gap-6'}>
								<CarSelector
										triggerClassname={'h-10 min-w-[9rem] bg-soft-gray text-sm font-medium text-dark-gray'}
								/>
								<ServiceSelector
										triggerClassname={'h-10 min-w-[9rem] bg-soft-gray text-sm font-medium text-dark-gray'}
								/>
							</div>
						</div>

						<ProfileSendOfferButton type={type} />
					</div>


					<div className={'grid grid-cols-1 550:grid-cols-2 1000:grid-cols-3 gap-4'}>
						{Array.from({length: 12}).map((_, index) => {
							return (
									<ProfileOfferCard key={index} brand={'Mercedes'} offers={['Engine', 'Battery', 'Tire', 'Electronics', 'Brake']} />
							)
						})}
					</div>

				</div>
			</DashboardContainer>
	)
}

