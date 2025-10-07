"use client"
import Engine from '@/assets/icons/services/Engine.svg'
import Suspension from '@/assets/icons/services/Suspension.svg'
import Battery from '@/assets/icons/services/Battery.svg'
import Electronics from '@/assets/icons/services/Electronics.svg'
import Diagnostics from '@/assets/icons/services/Diagnostics.svg'
import Brake from '@/assets/icons/services/Brake.svg'
import AC from '@/assets/icons/services/AC.svg'
import Tire from '@/assets/icons/services/Tire.svg'


import {CarouselItem} from "@/components/ui/carousel";
import {CarouselExt} from "@/components/shadcn-extended/CarouselExt";
import Container from "@/components/Container";
import {useEffect, useState} from "react";

export default function ServicesSlider() {
	const [active, setActive] = useState(false);

	useEffect(() => {
		// Function to check window width and update state
		const handleResize = () => {
			if (window.innerWidth < 1440) {
				setActive(true);
			} else {
				setActive(false);
			}
		};

		// Initial check on mount
		handleResize();

		// Add event listener for window resize
		window.addEventListener('resize', handleResize);

		// Cleanup function to remove event listener
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []); // Empty dependency array ensures this runs only on mount and unmount

	const cards = [
		{
			id: 0,
			name: 'Engine',
			logo: Engine
		},
		{
			id: 1,
			name: 'Suspension',
			logo: Suspension
		},
		{
			id: 2,
			name: 'Battery',
			logo: Battery
		},
		{
			id: 3,
			name: 'Electronics',
			logo: Electronics
		},
		{
			id: 4,
			name: 'Diagnostics',
			logo: Diagnostics
		},
		{
			id: 5,
			name: 'Brake',
			logo: Brake
		},
		{
			id: 6,
			name: 'Air Conditioning',
			logo: AC
		},
		{
			id: 7,
			name: 'Tire',
			logo: Tire
		}
	]
	return (
			<div className={'w-full bg-light-gray py-8 border-t-[1px] border-t-cool-gray'}>
				<Container>
					<CarouselExt active={active} contentClassname={'2xl:justify-center'}>
						{cards.map((c) => {
							const IconComponent = c.logo;
							return (
									<CarouselItem className={'basis-[160px]'} key={c.id}>
										<div className={'flex flex-col items-center gap-y-6'}>
											<IconComponent />
											<h5 className={'text-charcoal text-base font-semibold'}>{c.name}</h5>
										</div>
									</CarouselItem>
							)
						})}
					</CarouselExt>
				</Container>
			</div>
	)
}
