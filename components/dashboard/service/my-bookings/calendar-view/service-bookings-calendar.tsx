'use client';

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {CustomSwitch} from "@/components/app-custom/custom-switch";
import VerticalDotsIcon from "@/assets/icons/dashboard/dots-vertical.svg";
import ActionButtons from "@/components/dashboard/service/my-bookings/calendar-view/ActionButtons";
import TopCheckboxes from "@/components/dashboard/service/my-bookings/calendar-view/TopCheckboxes";
import ServiceBookingsAddReservationPopup
	from "@/components/dashboard/service/my-bookings/service-bookings-add-reservation-popup";
import {useState} from "react";
import ServiceBookingsAddEditSparePartsPopup
	from "@/components/dashboard/service/my-bookings/service-bookings-add-edit-spare-parts-popup";



interface IServiceBookingsCalendar {
	date: {
		fullDate: string;
		day: string;
	}
}


export default function ServiceBookingsCalendar({date}: IServiceBookingsCalendar) {



	const [selectedDateAndTime, setSelectedDateAndTime] = useState<null | {date: string; time:string}>(null)

	const headers = ["Engine 1", "Battery 1", "Oil Change 1", "Oil Change 2"];



	const data: {
		[key in string]: {
			[key in string]: {
 				car: string
				plate: string;
				service: string;
			} | null
		}
	} = {
		"09:00": {
			"Engine 1": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-999',
				service: 'Engine',
			},
			"Battery 1": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-666',
				service: 'Battery',
			},
			"Oil Change 1": 	{
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-444',
				service: 'Oil Change',
			},
			"Oil Change 2": null
		},
		"09:30": {
			"Engine 1": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-999',
				service: 'Engine',
			},
			"Battery 1": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-666',
				service: 'Battery',
			},
			"Oil Change 1": 	{
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-444',
				service: 'Oil Change',
			},
			"Oil Change 2": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-333',
				service: 'Oil Change',
			}
		},
		"10:00": {
			"Engine 1": null,
			"Battery 1": null,
			"Oil Change 1": null,
			"Oil Change 2": {
				car: 'Mercedes Benz CL 65 AMG',
				plate: '99-AA-333',
				service: 'Oil Change',
			}
		},
		"10:30": {
			"Engine 1": null,
			"Battery 1": null,
			"Oil Change 1": null,
			"Oil Change 2": null
		}
	}



	return (
			<div className={'flex flex-col gap-y-5'}>
				<TopCheckboxes />

				<div className={'overflow-x-auto'}>
					<div className={'min-w-fit'}>

						{/*HEADER*/}
						<div className={'pl-[10rem]'}>
							<div
									style={{
										gridTemplateColumns: `7rem repeat(${headers.length}, 18rem)`,
									}}
									className={`grid min-w-fit whitespace-nowrap gap-x-3`}
							>
								{/* Time Slot */}
								<div></div>

								{/* Services */}
								{headers.map((header) => (
										<div key={header} className="bg-inherit p-4">
											<CustomSwitch label={header} id={header} />
										</div>
								))}
							</div>
						</div>


						{/*Data*/}

						{Object.keys(data).map((key, index) => {
							return (
									<div key={key} className={'w-full h-[7rem] border-b-2 border-t-2 border-dashed border-cool-gray'}>
										<div className={'pl-[10rem] h-full'}>
											<div
													style={{
														gridTemplateColumns: `7rem repeat(${headers.length}, 18rem)`,
													}}
													className={`h-full grid min-w-fit whitespace-nowrap gap-x-3`}
											>
												{/* Time Slot */}
												<div className={'flex items-center justify-center'}>
													<CustomSwitch label={key} id={key} />
												</div>

												{/* Services */}
												{Object.keys(data[key]).map((v, index) => {
													const card = data[key][v];
													if(card) {
														return (
																<div key={v} className="flex">
																	<div className={'bg-white rounded-2xl p-4 h-[6.75rem] w-full flex flex-col gap-y-4'}>

																		<div className={'flex flex-col gap-1'}>
																			<div className={'flex items-center justify-between'}>
																				<h4 className={'text-sm text-dark-gray font-medium'}>{card.car}</h4>
																				<div className={'size-5 cursor-pointer flex justify-center items-center'}>
																					<VerticalDotsIcon className={'!h-4'}/>
																				</div>
																			</div>
																			<h4 className={'text-sm text-dark-gray font-medium'}>{card.plate}</h4>
																		</div>

																		<div className={'max-w-fit py-0.5 px-3 border border-soft-gray rounded-[40px] text-dark-gray text-xs font-medium'}>
																			{card.service}
																		</div>
																	</div>
																</div>
														)
													}
													return (
															<div key={v} className={"group duration-700 flex"}>
																<ActionButtons onReserveClick={() => {
																	setSelectedDateAndTime({
																		date: date.day,
																		time: key
																	})
																}}/>
															</div>
													)
												})}

											</div>
										</div>
									</div>
							)
						})}
					</div>
				</div>

				<ServiceBookingsAddReservationPopup selectedDateAndTime={selectedDateAndTime} closePopup={() => setSelectedDateAndTime(null)} />
			</div>
	);
}
