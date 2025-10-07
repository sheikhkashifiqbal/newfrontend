'use client'
import Container from "@/components/Container";
import UserPp from '@/assets/register/UserPP.png'
import {useEffect, useState} from "react";
import {cn} from "@/lib/utils";
import UserPPIcon from '@/assets/icons/register/UserPPIcon.svg'
import ServiceIcon from '@/assets/icons/register/ServiceIcon.svg'
import StoreIcon from '@/assets/icons/register/StoreIcon.svg'
import ArrowLeft from '@/assets/icons/register/arrow-narrow-left.svg'
import ArrowRight from '@/assets/icons/register/arrow-narrow-right.svg'
import {Button} from "@/components/ui/button";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import Link from "next/link";
import {useRouter} from "next/navigation";
import UserRegistration from "@/components/register/user-register/user-registration";
import RegisterFinishPopup from "@/components/register/register-finish-popup";
import ServiceRegistration from "@/components/register/service-register/service-registration-full";
import StoreRegistrationFull from "@/components/register/store-register/store-registration-full";

export default function RegisterPage() {
	const router = useRouter();
	const [selectedChoice,setSelectedChoice] = useState(0);
	const [showForm,setShowForm] = useState(false)
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [showForm]);



	const choices = [
		{
			id: 0,
			img: UserPPIcon,
			text: 'User Registration'
		},
		{
			id: 1,
			img: ServiceIcon,
			text: 'Service Registration'
		},
		{
			id: 2,
			img: StoreIcon,
			text: 'Store Registration'
		}
	]
	function closeFormAndComeBack() {
		setShowForm(false)
	}
	return (
			<div className={'bg-light-gray'}>
				<Container className={'flex'}>
					{!showForm && (
							<div className={'pt-10 pb-20 mx-auto max-w-[808px] flex justify-center gap-y-6 flex-col'}>
								<div className={'flex flex-col gap-y-8'}>
									<h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>Registration</h1>
									<h5 className={'text-charcoal text-xl font-medium'}>Get started by choosing how you'd like to register</h5>
								</div>
								<div className={'grid grid-cols-1 gap-y-4 600:grid-cols-3 gap-x-4'}>
									{choices.map((choice) => {
										const IconComponent = choice.img;
										return (
												<div onClick={() => setSelectedChoice(choice.id)} key={choice.text} className={cn('cursor-pointer duration-300 ease-linear items-center bg-white flex flex-col gap-y-8 rounded-3xl py-16 px-14', choice.id === selectedChoice && 'border border-steel-blue/20 shadow-[0px_24px_32px_0px_#DBE2EF]')}>
													{/*<img className={'size-20'} src={choice.img}/>*/}
													<IconComponent />
													<h4 className={'text-center text-black text-2xl font-medium'}>{choice.text}</h4>
												</div>
										)
									})}
								</div>
								<div className={'pt-12 flex justify-between items-center'}>
									<Button onClick={() => router.back()} className={'h-12 py-3 px-6 items-center justify-center gap-x-4'}>
										<ArrowLeft className={'!size-6'}/>
										Back
									</Button>
									<CustomBlueBtn onClick={() => setShowForm(true)} className={'h-12 rounded-[12px] flex justify-center items-center gap-x-4 py-3 px-6'} show={"children"}>
										Next
										<ArrowRight className={'!size-6'}/>
									</CustomBlueBtn>
								</div>
							</div>
					)}
					{showForm && selectedChoice === 0 && <UserRegistration openPopup={() => setIsPopupOpen(true)} closeFormAndGoBack={closeFormAndComeBack} />}
					{showForm && selectedChoice === 1 && <ServiceRegistration openPopup={() => setIsPopupOpen(true)} closeFormAndGoBack={closeFormAndComeBack} />}
					{showForm && selectedChoice === 2 && <StoreRegistrationFull openPopup={() => setIsPopupOpen(true)} closeFormAndGoBack={closeFormAndComeBack} />}
				</Container>

				<RegisterFinishPopup isOpen={isPopupOpen} closePopup={() => setIsPopupOpen(false)}/>
			</div>
	)
}
