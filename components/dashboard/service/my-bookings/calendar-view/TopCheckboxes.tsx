'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomSwitch} from "@/components/app-custom/custom-switch";
import SmallNumBadge from "@/components/app-custom/small-num-badge";
import {useState} from "react";

export default function TopCheckboxes() {
	const [services,setServices] = useState([
		{
			label: 'All services',
			active: true,
			number: 300,
		},
		{
			label: 'Engine',
			active: true,
			number: 10,
		},
		{
			label: 'Battery',
			active: true,
			number: 100,
		},
		{
			label: 'Tire',
			active: true,
			number: 24,
		},
		{
			label: 'Electronics',
			active: true,
			number: 100,
		},
		{
			label: 'Brake',
			active: true,
			number: 66,
		}
	])
	return (
			<div className={'border-b border-b-soft-gray'}>
				<DashboardContainer>
					<div className={'flex gap-x-6 gap-y-1 flex-wrap'}>
						{services.map((service) => {
							return (
									<div
											className={'flex items-center gap-3 py-2 min-w-[12rem]'}
											key={service.label}
									>
										<CustomSwitch
												onChecked={(checked) => {
													setServices((prev) => {
														return prev.map((s) => {
															let isActive = s.active;

															//all services should be on the state of all services
															if(service.label === "All services") {
																isActive = checked;
															} else {
																if(s.label === "All services") {
																	if(!checked) {
																		isActive = false;
																	} else {
																		const currentCheckedServices = prev.filter((s) => s.active);
																		if(currentCheckedServices.length === prev.length - 2) {
																			isActive = true;
																		}
																	}
																}
															}

															//switch only specific service
															if(s.label === service.label) {
																isActive = checked;
															}
															return {
																...s,
																active: isActive
															}
														})
													})
												}}
												checked={service.active}
												label={service.label}
												id={service.label}
										/>

										<SmallNumBadge active={service.active} num={service.number}/>
									</div>
							)
						})}
					</div>
				</DashboardContainer>
			</div>
	)
}
