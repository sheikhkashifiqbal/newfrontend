import {PropsWithChildren, ReactNode} from "react";
import {cn} from "@/lib/utils";

export default function Container({children, className}: {children: ReactNode, className?: string}) {
	return (
			<div className={cn('h-full bg-inherit mx-auto w-[95%] sm:w-[90%] md:w-[85%]', className)}>
				{children}
			</div>
	)
}
