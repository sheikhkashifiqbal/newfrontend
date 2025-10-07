import React from "react";
import {ServiceRegistrationTip} from "@/components/register/service-register/service-registration-step-2";
import CustomCheckbox from "@/components/app-custom/custom-checkbox";
import { Separator } from "@/components/ui/separator"


interface IServiceRegistrationStep3 {
	form: any
}


export default function ServiceRegistrationStep3({form}: IServiceRegistrationStep3) {

	const items = [
		{
			id: "branch1",
			label: "Branch 1",
		},
		{
			id: "branch2",
			label: "Branch 2",
		},
		{
			id: "branch3",
			label: "Branch 3",
		},
	] as const

	const branchTypes = ["Central branches* 200 AZN", "Regional branches* 300AZN"]

	return (
			<>
				<ServiceRegistrationTip />


				<div className={'grid grid-cols-2'}>
					{branchTypes.map((bType, index) => {
						return (
								<div key={bType} className={'flex flex-col gap-y-3'}>
									<h5 className={'text-base text-steel-blue font-semibold'}>
										{bType}
									</h5>
									<div className={'flex flex-col gap-y-2'}>
										<CustomCheckbox label={"Branch 1"} id={"branch1"} />
										<CustomCheckbox label={"Branch 2"} id={"branch2"} />
										<CustomCheckbox label={"Branch 3"} id={"branch3"} />
									</div>
								</div>
						)
					})}
				</div>

				<Separator className={'bg-steel-blue/20'}/>

				<div className={'flex flex-col gap-y-3'}>
					<h5 className={'text-steel-blue font-semibold text-base'}>Total</h5>

					<div className={'bg-white flex flex-col gap-4 p-6 rounded-3xl max-w-[392px]'}>
						<div className={'flex flex-col gap-0.5'}>
							<h3 className={'text-charcoal font-semibold text-[2rem] leading-[2.5rem]'}>AZN 1500</h3>
							<h6 className={'text-charcoal/40 text-xs font-medium'}>per month</h6>
						</div>

						<h5 className={'text-royal-blue text-xs font-medium'}>*first 2 month is free</h5>
					</div>
				</div>


				<CustomCheckbox labelClassname={'text-sm'} label={"I accept the terms & conditions"} id={"service-register-terms-checkbox"} />

			</>
	)
}
