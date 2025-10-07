'use client'
import SupportImg from '@/assets/Support/supportImg.png'
import Container from "@/components/Container";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import MailIcon from '@/assets/icons/support/MailIcon.svg'
import PhoneIcon from '@/assets/icons/support/PhoneIcon.svg'
import {useState} from "react";
import SupportReportProblemPopup from "@/components/support/support-report-problem-popup";


const cards = [
	{
		id: 0,
		title: 'Text us',
		titleSm: '',
		desc: 'Text us for help with booking, account info and etc.',
		btn: 'Send message',
		icon: MailIcon
	},
	{
		id: 1,
		title: 'E-mail to us',
		titleSm: 'support@service.az',
		desc: 'Call us for help with booking, account info and etc.',
		btn: 'Send e-mail',
		icon: PhoneIcon
	},
	{
		id: 2,
		title: 'Text us',
		titleSm: '+994 55 995 47 65',
		desc: 'Call us for help with booking, account info and etc.',
		btn: 'Call',
		icon: PhoneIcon
	}
];


function Card({card, onClick}: {card: typeof cards[0], onClick?: () => void}) {
	const IconComponent = card.icon
	return (
			<div className={'bg-white rounded-3xl p-6 flex flex-col  gap-y-4'}>
				<div className={'flex items-center justify-between'}>
					<div className={'flex gap-x-1'}>
						<IconComponent className={'!size-6'}/>
						<h4 className={'text-black text-xl font-medium'}>{card.title}</h4>
					</div>
					<h5 className={'text-black text-base font-medium'}>{card.titleSm}</h5>
				</div>
				<p className={'text-medium-gray text-sm max-w-[30ch]'}>
					{card.desc}
				</p>
				<Button onClick={onClick} className={'bg-steel-blue cursor-pointer max-w-fit py-3 px-6 rounded-[8px] flex items-center justify-center'} asChild={true}>
					{card.id === 0 ? (
							<h5 className={'text-white text-base font-medium'}>
								{card.btn}
							</h5>
					) : (
							<Link className={'text-white text-base font-medium'} href={'/'}>
								{card.btn}
							</Link>
					)}
				</Button>
			</div>
	)
}

export default function Support(){

	const [isPopupOpen, setIsPopupOpen] = useState(false)

	return (
			<div className={'bg-light-gray min-h-fit flex flex-col gap-y-10'}>
				<img className={'w-full min-h-[150px] object-cover'} src={SupportImg.src} alt={"Support img"}/>
				<Container className={'pb-[15%]'}>
					<div className={'flex flex-col gap-y-10'}>
						<h1 className={'text-black font-medium text-[2rem] leading-[2.5rem]'}>We are here to help!</h1>
						<div className={'grid gap-5 grid-cols-1 840:grid-cols-2 xl:grid-cols-3'}>
							{cards.map((card) => {
								return (
									<Card
											onClick={() => {
												if (card.id === 0) {
													setIsPopupOpen(true)
												}
											}}
											key={card.id} card={card}
									/>
								)
							})}
						</div>
					</div>
				</Container>
				<SupportReportProblemPopup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)} />
			</div>
	);
}
