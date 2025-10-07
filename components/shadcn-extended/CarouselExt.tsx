import * as React from "react"
import Autoplay from "embla-carousel-autoplay"



import { Card, CardContent } from "@/components/ui/card"
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel"
import {ReactNode} from "react";
import {cn} from "@/lib/utils";

interface ICarouselExt {
	showButtons?: boolean
	children: ReactNode
	contentClassname?: String
	autoPlay?: boolean
	active?: boolean
}

export function CarouselExt({showButtons = false, children, contentClassname, autoPlay = true, active = true}: ICarouselExt) {
	const cPlugins = [];
	if(autoPlay) {
		cPlugins.push(Autoplay({ delay: 2000, stopOnInteraction: false }))
	}
	return (
			<Carousel
					plugins={cPlugins}
					opts={{
						active: active,
						align: "start",
					}}
					className="w-full"
			>
				<CarouselContent className={cn(contentClassname)}>
					{/*{Array.from({ length: 5 }).map((_, index) => (*/}
					{/*		<CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">*/}
					{/*			<div className="p-1">*/}
					{/*				<Card>*/}
					{/*					<CardContent className="flex aspect-square items-center justify-center p-6">*/}
					{/*						<span className="text-3xl font-semibold">{index + 1}</span>*/}
					{/*					</CardContent>*/}
					{/*				</Card>*/}
					{/*			</div>*/}
					{/*		</CarouselItem>*/}
					{/*))}*/}
					{children}
				</CarouselContent>
				{showButtons && (
						<>
							<CarouselPrevious />
							<CarouselNext />
						</>
				)}
			</Carousel>
	)
}
