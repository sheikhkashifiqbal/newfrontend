'use client'


import serviceCover from "@/assets/profile/service-cover.jpg";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import Link from "next/link";
import {ChevronRight, Star, MapPin, LucideSmartphone} from "lucide-react";
import ServiceLogo from "@/assets/icons/services/ServiceLogo.svg";
import Container from "@/components/Container";
import ClockCheck from '@/assets/icons/dashboard/clock-check.svg'

export default function ProfileCover() {
	return (
			<div className={'flex flex-col gap-y-8'}>
				<Container>
					<div
							style={{
								background: `linear-gradient(90deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 100%), url(${serviceCover.src}) no-repeat center/cover`
							}}
							className="w-full h-72 rounded-3xl pt-10"
					>
						<DashboardContainer className={'flex flex-col gap-y-12'}>
							<div className={'flex gap-x-2 items-center'}>
								<Link className={'text-xs text-white/70'} href={'/'}>Home</Link>
								<ChevronRight className={'size-4 text-white/70'}/>
								<Link className={'text-xs text-white/70'} href={'/services'}>Services</Link>
								<ChevronRight className={'size-4 text-white/70'}/>
								<Link className={'text-xs font-medium text-white'} href={'/profile/service'}>Performance Center</Link>
							</div>


							<div className={'flex items-center gap-x-6'}>
								<ServiceLogo className={'!size-[4.5rem]'}/>

								<div className={'flex flex-col gap-y-2'}>
									<h4 className={'text-white font-semibold text-3xl'}>22Performance Center</h4>
									<div className={'flex items-center gap-x-1'}>
										<Star className={'size-6 fill-sunset-peach text-sunset-peach'}/>
										<h6 className={'font-semibold text-sm text-white'}>4.5</h6>
									</div>
								</div>
							</div>
						</DashboardContainer>

					</div>
				</Container>

				<DashboardContainer className={'grid grid-cols-1 500:grid-cols-2 xl:grid-cols-3 gap-8'}>
					<div className={'flex gap-3'}>
						<MapPin className={'size-6 text-charcoal'}/>
						<div className={'flex flex-col gap-y-2'}>
							<h5 className={'text-base font-medium text-charcoal'}>Bakı ş., Heydər Əliyev pr., 191</h5>
							<Link className={'text-base font-medium underline text-sky-blue'} href={'#'}>Google Map</Link>
						</div>
					</div>

					<div className={'flex gap-3'}>
						<ClockCheck className={'!size-6 text-charcoal'}/>
						<div className={'flex flex-col'}>
							<h5 className={'text-base font-medium text-charcoal'}>
								Monday-Friday: 09:00-18:00
							</h5>
							<h5 className={'text-base font-medium text-charcoal'}>
								Saturday: 10:00-16:00
							</h5>
						</div>
					</div>

					<div className={'flex gap-3'}>
						<LucideSmartphone className={'!size-6 text-charcoal'}/>
						<div className={'flex flex-col'}>
							<h5 className={'text-base font-medium text-charcoal'}>
								+99450 289-09-85
							</h5>
							<h5 className={'text-base font-medium text-charcoal'}>
								+99450 289-09-80
							</h5>
						</div>
					</div>
				</DashboardContainer>
			</div>
	)
}
