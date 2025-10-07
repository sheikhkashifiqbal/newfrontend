'use client'

import {Button} from "@/components/ui/button";
import LoginPopupModal from "@/components/login/LoginPopupModal";
import {useState} from "react";

export default function LoginButton() {
	const [openPopup,setOpenPopup] = useState(false);
	return (
			<>
				<Button onClick={() => setOpenPopup(true)} className={'bg-inherit border-0 py-2 px-6 text-steel-blue text-base font-medium shadow-none'}>
					Giriş
				</Button>
				<LoginPopupModal isOpen={openPopup} setIsOpen={setOpenPopup}/>
			</>
	)
}
