"use client";

import {useEffect, useState} from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import useHamburgerStore from "@/lib/store/HamburgerStore";
import {HeaderButtons, HeaderNav} from "@/components/Header";
import {usePathname} from "next/navigation";

export default function MySidebar() {
	const { isOpen, toggle, close } = useHamburgerStore();
	const pathname = usePathname();

	const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);


	// the required distance between touchStart and touchEnd to be detected as a swipe
	const minSwipeDistance = 50;

	const onTouchStart = (e: TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };


    const onTouchMove = (e: TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        
        const distance = touchEnd - touchStart;
        const isLeftSwipe = distance < -minSwipeDistance;
        const isRightSwipe = distance > minSwipeDistance;
        
        if (isLeftSwipe && isOpen) {
            close();
        } else if (isRightSwipe && !isOpen) {
            toggle();
        }
    };

	useEffect(() => {
		close()
	},[pathname])

	return (
			<>
				{/* Overlay */}
				{isOpen && (
						<div
								className="fixed inset-0 bg-black/30 z-40"
								onClick={() => close()}
						></div>
				)}

				{/* Sidebar */}
				<div
					//@ts-ignore 
					onTouchStart={onTouchStart}
					//@ts-ignore
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
						className={`fixed left-0 top-0 h-full w-[60%] 450:w-[50%] bg-white shadow-lg z-50 transform transition-transform ${
								isOpen ? "translate-x-0" : "-translate-x-full"
						}`}
				>
					<div className="p-4 flex justify-between items-center border-b">
						<h2 className="text-lg font-semibold">Menu</h2>
						<Button variant="ghost" onClick={() => close()}>
							<X size={20} />
						</Button>
					</div>
					<div className={'flex flex-col gap-y-4'}>
						<HeaderNav liClassname={'hover:bg-gray-100 block w-full text-center p-2'} navClassname={'block p-4'} ulClassname={'flex-col gap-y-5'}/>
						<HeaderButtons divClassname={'flex flex-col gap-y-3'}/>
					</div>
				</div>
			</>
	);
}
