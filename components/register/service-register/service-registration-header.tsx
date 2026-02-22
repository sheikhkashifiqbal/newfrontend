'use client'


import {cn} from "@/lib/utils";

interface IServiceRegistrationHeader {
	step: 1 | 2 | 3
}
export default function ServiceRegistrationHeader({step}: IServiceRegistrationHeader) {
	return (
			<div className={'flex flex-col gap-y-8'}>
				<h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>Registration</h1>
				<div className={'grid grid-cols-3 gap-x-4'}>
					{Array.from({length: 3}).map((_, index) => {
						return (
								<div key={index} className={cn('h-2 w-full rounded-[200px] bg-steel-blue/10', index < step && 'bg-steel-blue')}></div>
						)
					})}
				</div>
				<div className={'flex flex-col'}>
					<h5 className={'text-charcoal text-base'}>Step {step} of 3</h5>
					<h4 className={'text-charcoal text-xl font-medium'}>
						{step === 1 ? "Enter your company and branch details" : step === 2 ? "About the services you provide" : "Select the subscription for yout fit"}
					</h4>
				</div>
			</div>
	)
}
