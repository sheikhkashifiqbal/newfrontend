"use client"
import NotFoundImg from '@/assets/NotFound/notFoundImg.png'
import {Button} from "@/components/ui/button";
import Link from "next/link";
export default function NotFound() {
	return (
			<div className={'min-h-screen bg-light-gray flex flex-col gap-y-5 justify-center items-center'}>
				<div className={'flex flex-col items-center relative'}>
					<h1 className={'text-black font-medium text-9xl absolute top-[-60px]'}>404</h1>
					<img src={NotFoundImg.src} alt={"Not found image"}/>
				</div>
				<h4 className={'text-black text-xl text-center max-w-[40ch]'}>
					Looks like you found a page that does not exist or you dont have access to.
				</h4>
				<Button className={'bg-steel-blue rounded-[8px] py-3 px-6 flex items-center justify-center'} asChild={true}>
					<Link className={'text-white font-semibold text-base'} href={'/'}>
						Return home
					</Link>
				</Button>
			</div>
	)
}
