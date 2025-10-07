'use client'
import Container from "@/components/Container";
import {cn} from "@/lib/utils";
import {ReactNode} from "react";

interface IDashboardContainer {
	containerClassname?: string;
	className?: string;
	children: ReactNode
}



export default function DashboardContainer(
		{
				containerClassname,
				className,
				children
		}: IDashboardContainer
) {
	return (
			<Container className={containerClassname}>
				<div className={cn('w-full 500:w-[95%] lg:w-[90%] mx-auto', className)}>
					{children}
				</div>
			</Container>
	)
}
