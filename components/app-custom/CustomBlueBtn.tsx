'use client'

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import {ReactNode} from "react";


interface ICustomBlueBtn {
	text?: string
	className?: string
	onClick?: () => void
	children?: ReactNode
	show?: "text" | "children"
	type?: "submit" | "reset" | "button" | undefined
}

export default function CustomBlueBtn(
		{
				text = 'Search',
				className,
				onClick,
				children = 'custom children',
				show = "text",
				type = undefined
		}: ICustomBlueBtn
) {
	return (
			<Button type={type} onClick={onClick && onClick} className={cn('max-h-fit bg-steel-blue rounded-[8px] py-3 px-8 text-base font-medium text-white', className)}>
				{show === "text" ? text : children}
			</Button>
	)
}
