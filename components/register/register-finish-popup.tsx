'use client'

import {memo, useEffect, useState} from "react";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {useRouter} from "next/navigation";


interface IRegisterFinishPopup {
	isOpen: boolean
	closePopup: () => void;
}

function RegisterFinishPopup({isOpen, closePopup}: IRegisterFinishPopup) {
	const router = useRouter();
	useEffect(() => {
		if(isOpen) {
			const timeout = setTimeout(() => {
				closePopup()
				router.replace('/services');
			}, 2000)

			return () => {
				clearTimeout(timeout)
			}
		}
	}, [isOpen])

	return (
			<Dialog open={isOpen}>
				<DialogContent className={'flex flex-col py-8 gap-y-8 rounded-3xl w-[520px] bg-light-gray'}>
					<DialogHeader className={'border-b p-8 pt-0 border-b-blue-gray'}>
						<DialogTitle className={'text-charcoal font-medium text-2xl'}>Account Created</DialogTitle>
					</DialogHeader>
					<div className={'px-8'}>
						<h4 className={'text-charcoal/50 font-semibold text-xl'}>
							Registration was successful! Redirecting to Home page (services) page!
						</h4>
					</div>
				</DialogContent>
			</Dialog>
	)
}

export default memo(RegisterFinishPopup)
