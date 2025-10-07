"use client"
import {Menu, X} from "lucide-react";
import {Button} from "@/components/ui/button";
import useHamburgerStore from "@/lib/store/HamburgerStore";

export default function HamburgerMenu() {
	const {isOpen, toggle} = useHamburgerStore();
	return (
			<Button
					className="size-8 block sm:hidden bg-steel-blue text-white p-2 rounded-md"
					onClick={toggle}
			>
				{isOpen ? <X size={32} /> : <Menu size={32} />}
			</Button>
	)
}
