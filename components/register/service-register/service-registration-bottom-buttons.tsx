'use client'


import {Button} from "@/components/ui/button";
import ArrowLeft from "@/assets/icons/register/arrow-narrow-left.svg";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn-clone";
import ArrowRight from "@/assets/icons/register/arrow-narrow-right.svg";


interface IServiceRegistrationBottomButtons {
	form: any
	step: 1 | 2 | 3
	setStep: (step: 1 | 2 | 3 ) => void
	closeFormAndGoBack: () => void
	openPopup: () => void
}

export default function ServiceRegistrationBottomButtons({
		form,
		step,
		setStep,
		closeFormAndGoBack,
		openPopup
																												 }: IServiceRegistrationBottomButtons) {
	return (
			<div className={'pt-12 flex justify-between items-center'}>
				<Button onClick={() => {
					if(step === 1) {
						closeFormAndGoBack()
					} else {
						// @ts-ignore
						setStep(step - 1);
					}
				}} className={'py-3 px-6 items-center justify-center gap-x-4'}>
					{/*<Link href={'/'}>*/}
					<ArrowLeft className={'!size-6'}/>
					Back
					{/*</Link>*/}
				</Button>
				
					
				
				<CustomBlueBtn
						onClick={async () => {
							if(step < 3) {
								// @ts-ignore
								setStep(step + 1)
								// const isValid = await form.trigger()
								// if(isValid) {
								// 	// @ts-ignore
								// 	setStep(step + 1);
								// } else {
								//
								// }
							}

							const regBtn : any = document.querySelector<HTMLButtonElement>('button.reg-company');
							console.log("Step", step);
							if (step == 3) {
								regBtn.click();
							} else {
								// optional fallback: submit the current form if the target button isn't found
								//e.currentTarget.form?.requestSubmit?.();
							}
							
	
						}}
						className={'rounded-[12px] justify-center flex items-center gap-x-4 py-3 px-6'} show={"children"}>
					{step < 3 ? "Next" : "Register Company & Branches"}

					<ArrowRight className={'!size-6'}/>
				</CustomBlueBtn>
			</div>
			
	)
	
}
