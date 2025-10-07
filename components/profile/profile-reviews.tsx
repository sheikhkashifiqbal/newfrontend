'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { Rating } from 'react-simple-star-rating'
import * as React from "react";
import {ProfileReviewsFilterSelector} from "@/components/profile/profile-reviews-filter-selector";
import {ScrollArea} from "@/components/ui/scroll-area";



const reviews = [
	{
		id: 1,
		star: 5,
		comment: 'Fast and efficient service! The team was friendly, and my car was ready within the promised time. Highly recommend',
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 2,
		star: 4,
		comment: 'Great attention to detail! My car looks brand new. Took a bit longer than expected, but worth the wait.',
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 3,
		star: 5,
		comment: "Affordable prices and honest advice. Fixed my brakes the same day. I'll definitely return for future needs.",
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 4,
		star: 3,
		comment: "Good cleaning, but the interior wasn't as spotless as I hoped for the price. Staff was polite though.",
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 5,
		star: 4,
		comment: 'Fast and efficient service! The team was friendly, and my car was ready within the promised time. Highly recommend',
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 6,
		star: 2,
		comment: 'Fast and efficient service! The team was friendly, and my car was ready within the promised time. Highly recommend',
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
	{
		id: 7,
		star: 3,
		comment: 'Fast and efficient service! The team was friendly, and my car was ready within the promised time. Highly recommend',
		by: 'Kamran Rustamli',
		date: '12.12.2024'
	},
]


export default function ProfileReviews() {
	return (
			<DashboardContainer>
				<div className={'flex flex-col 900:flex-row gap-6 justify-between'}>

					{/*Left part*/}
					<div className={'flex basis-[40%] flex-col gap-y-6'}>

						<div className={'flex flex-col gap-y-2'}>

							<div className={'flex items-center gap-x-1'}>
								<Rating
										initialValue={4.5}
										readonly={true}
										allowFraction={true}
										transition={true}
										SVGclassName={`inline-block`}
										size={24}
										emptyColor={'#E9ECEF'}
										fillColor={'#F9B774'}
										allowHover={false}
								/>
								<h5 className={'text-dark-gray font-medium'}>4.5 out of 5</h5>
							</div>

							<h5 className={'text-charcoal/50 font-medium text-sm'}>774 ratings</h5>
						</div>

						<div className={'flex flex-col gap-y-2'}>
							{Array.from({length: 5}).map((_, index) => {
								const star = 5 - index;
								return (
										<div className={'flex items-center gap-x-4'} key={index}>
											<h6 className={'text-dark-gray text-sm font-medium w-12'}>{star} star</h6>
											<div className={' relative border-[0.5px] border-black/10 rounded-[4px] h-5 w-[12.5rem]'}>
												<div className={'absolute bg-sunset-peach h-full w-1/5'}></div>
											</div>
											<h6 className={'text-charcoal/50 text-sm font-medium'}>20%</h6>
										</div>
								)
							})}
						</div>

					</div>


					{/*Right part*/}
					<div className={'flex basis-[60%] flex-col gap-y-8'}>

						<div className={'flex flex-col gap-y-3'}>
							<h5 className={'text-dark-gray text-sm font-medium'}>Filter by</h5>
							<ProfileReviewsFilterSelector
									value={'all-stars'}
									triggerClassname={'max-w-[8rem] h-10 bg-soft-gray text-sm font-medium text-dark-gray'}
							/>
						</div>


						<ScrollArea className={'h-[400px]'}>
							<div className={'flex flex-col gap-y-6'}>
								{reviews.map((review) => {
									return (
											<div
													className={'flex gap-x-4 '}
													key={review.id}
											>
												<Rating
														initialValue={review.star}
														readonly={true}
														allowFraction={true}
														transition={true}
														SVGclassName={`inline-block`}
														size={20}
														emptyColor={'#E9ECEF'}
														fillColor={'#F9B774'}
														allowHover={false}
												/>

												<div className={'flex flex-col gap-y-2'}>
													<h5 className={'text-dark-gray text-sm'}>{review.comment}</h5>
													<div className={'flex items-center gap-x-3'}>
														<h6 className={'text-charcoal/50 text-xs italic font-medium'}>By {review.by}</h6>
														<h6 className={'text-charcoal/50 text-xs italic font-medium'}>{review.date}</h6>
													</div>
												</div>
											</div>
									)
								})}
							</div>
						</ScrollArea>



					</div>
				</div>
			</DashboardContainer>
	)
}
