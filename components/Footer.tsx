'use client'
import Logo from '@/assets/vehicleopsLogo.svg'
import Link from "next/link";
import InputExt from "@/components/shadcn-extended/InputExt";
import RightArrowIcon from "@/assets/icons/RightArrow.svg"
import QrCodeSvg from "@/assets/Footer/qrCode.svg"
import AppStoreBtn from '@/assets/Footer/appStoreBtn.svg'
import PlayStoreBtn from '@/assets/Footer/googlePlayBtn.svg'
import Container from "@/components/Container";
function QuickLinks() {
	const links = [
		{
			id: 0,
			text: 'Home page',
			path: '/',
		},
		{
			id: 1,
			text: 'Services',
			path: '/services'
		},
		{
			id: 2,
			text: "Repair parts",
			path: '/'
		},
		{
			id: 3,
			text: 'Support',
			path: '/'
		}
	]
	return (
			<div className={''}>
				<div className={'flex flex-col gap-y-4 justify-self-center 600:pl-8'}>
					<h5 className={'text-xs font-medium text-charcoal'}>Quick Links</h5>
					<ul className={'flex flex-col gap-y-4'}>
						{links.map((l) => {
							return (
									<Link key={l.id} className={'inline text-charcoal80 font-medium text-base'} href={l.path}>
										{l.text}
									</Link>
							)
						})}
					</ul>
				</div>
			</div>
	)
}

function PromotionInput() {
	return (
			<div className={'h-12 flex max-w-[250px]'}>
				<InputExt className={'h-full pl-3 border-[1px] rounded-l-[8px] rounded-r-none border-charcoal/20 text-charcoal placeholder-charcoal/65 text-sm'} placeholder={"Get product updates"} />
				<div className={'h-full w-[50px] flex justify-center items-center bg-steel-blue rounded-r-[8px]'}>
					<RightArrowIcon />
				</div>
			</div>
	)
}

function Promotion() {
	return (
			<div className={''}>
				<div className={'justify-self-center 600:justify-self-end flex flex-col gap-y-4'}>
					<div className={'flex flex-col gap-y-3'}>
						<h5 className={'text-xs text-charcoal font-medium'}>Subscribe</h5>
						<PromotionInput />
					</div>

					<div className={'flex flex-col gap-y-3'}>
						<h5 className={'text-xs text-charcoal font-medium'}>Get Our App</h5>
						<div className={'flex gap-6 flex-row 600:flex-col md:flex-row'}>
							<QrCodeSvg className={'size-[70px]'}/>
							<div className={'flex flex-col gap-3'}>
								<Link href={'/'}>
									<AppStoreBtn className={'min-h-[35px] min-w-[120px] object-cover'}/>
								</Link>
								<Link href={'/'}>
									<PlayStoreBtn className={'min-h-[35px] min-w-[120px] object-cover'} />
								</Link>
							</div>
						</div>
					</div>
				</div>
			</div>
	)
}

function LeftPart() {
	return (
			<div className={'flex flex-col justify-between items-center 600:items-start gap-y-10'}>
				<Logo className={'!size-12'} />
				<div className={'flex flex-col gap-y-0.5 justify-self-center 500:justify-self-start'}>
					<h5 className={'text-xs font-medium text-charcoal'}>E-mail</h5>
					<Link className={'text-slate-gray text-sm'} href={''}>
						support@carservice.az
					</Link>
				</div>
				<p className={'text-sm text-slate-gray hidden 600:block'}>
					Copyright © 2024 Carservice MMC. All rights reserved.
				</p>
			</div>
	)
}

export default function Footer() {
	return (
			<footer className={'w-full bg-white py-[1.875rem]'}>
				<Container>
					<div className={'flex flex-col gap-y-8'}>
						{/*<div className={'flex justify-center items-center 500:justify-start'}>*/}
						{/*	<img className={'size-12'} src={Logo.src} alt={"Logo"}/>*/}
						{/*</div>*/}
						<div className={'flex flex-col gap-y-10 items-center'}>
							<div className={'grid grid-cols-1 gap-y-10 600:grid-cols-3'}>
								<LeftPart />
								<QuickLinks />
								<Promotion />
							</div>
							<p className={'text-sm text-slate-gray block 600:hidden'}>
								Copyright © 2024 Carservice MMC. All rights reserved.
							</p>
						</div>
					</div>
				</Container>
			</footer>
	)
}
