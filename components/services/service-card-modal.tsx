"use client"
import { Button } from "@/components/ui/button"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog"
import {cn} from "@/lib/utils";
import {CarSelector} from "@/components/services/selectors/car-selector";

import {CarModelSelector} from "@/components/services/selectors/car-model-selector";
import {ServiceSelector} from "@/components/services/selectors/service-selector";
import {addDays, eachDayOfInterval, format, getDay, getWeek} from "date-fns";
import {memo, useEffect, useRef, useState} from "react";
import {X} from "lucide-react";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog"

import ServiceLogo from '@/assets/icons/services/ServiceLogo.svg'
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import {SelectionProvider, useSelection} from "@/hooks/services/useSelection";

function ServiceCardModalCarSelectors() {
  const { setSelections } = useSelection();
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const triggerClassname = 'border-soft-gray text-misty-gray text-sm italic font-medium';

  return (
    <div className={'w-full grid grid-cols-2 600:grid-cols-3 gap-6'}>
      <div className={'flex flex-col gap-y-3'}>
        <label className={'text-dark-gray text-sm font-medium'}>Car brand *</label>
        <CarSelector
          onChange={(value) => {

            const brandId = Number(value);
            setSelectedBrandId(brandId);
            setSelections(prev => ({ ...prev, selectedCar: value }));
          }}
          placeholder={'Select the car brand'}
          triggerClassname={triggerClassname}
        />
      </div>
	  
      <div className={'flex flex-col gap-y-3'}>
        <label className={'text-dark-gray text-sm font-medium'}>Brand model *</label>
        <CarModelSelector
          brandId={selectedBrandId}
          value={selectedModel}
          onChange={(value) => {
            setSelectedModel(value);
            setSelections(prev => ({ ...prev, selectedModel: value }));
          }}
          placeholder="Select model333"
          triggerClassname={triggerClassname}
        />
      </div>

      <div className={'flex flex-col gap-y-3'}>
        <label className={'text-dark-gray text-sm font-medium'}>Service</label>
        <ServiceSelector
          onChange={(value) => setSelections(prev => ({ ...prev, selectedService: value }))}
          placeholder={'Select the service'}
          triggerClassname={triggerClassname}
        />
      </div>
    </div>
  );
}


export function ServiceCardModalDateSelector() {
	const {selections, setSelections} = useSelection();
	const today = new Date();
	const next7Days = Array.from({ length: 7 }, (_, i) => ({
		fullDate: format(addDays(today, i), 'dd MMM yyy'),
		day:format(addDays(today, i), 'dd MMM')
	}));

	function setDay(day: string) {
		setSelections(prev => ({...prev, selectedDay: day}));
	}

	useEffect(() => {
		setDay(next7Days[0].fullDate);
	}, [])
	return (
			<div className={'flex flex-col gap-y-3'}>
				<h5 className={'text-dark-gray text-sm font-medium'}>Reservation Date</h5>
				<div className={'w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4'}>
					{next7Days.map((day) => {
						return (
								<div onClick={() => setDay(day.fullDate)} key={day.day} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', day.fullDate === selections.selectedDay && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
									{day.day}
								</div>
						)
					})}
				</div>
			</div>
	)
}




function ServiceCardModalTimeSelector() {
	const {selections, setSelections} = useSelection();
	const times = ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
		"12:00 PM", "12:30 PM", "13:00 PM", "13:30 PM", "14:00 PM", "14:30 PM"]

	function setTime(time: string) {
		setSelections(prev => ({...prev, selectedTime: time}));
	}

	useEffect(() => {
		setTime(times[0]);
	},[])
	return (
			<div className={'flex flex-col gap-y-3'}>
				<h5 className={'text-dark-gray text-sm font-medium'}>Reservation time</h5>
				<div className={'grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2'}>
					{times.map((time) => {
						return (
								<div onClick={() => setTime(time)} key={time} className={cn('flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray', time === selections.selectedTime && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold')}>
									{time}
								</div>
						)
					})}
				</div>
			</div>
	)
}

interface IServiceCardModal {
	selectedCardId: number | null
	closeModal: () => void
}


export function ServiceCardModalStepOne() {
	return (
			<div className="w-full px-8 flex flex-col gap-y-8">
				<ServiceCardModalCarSelectors />
				<ServiceCardModalDateSelector  />
				<ServiceCardModalTimeSelector />
			</div>
	)
}

interface IServiceCardModalStepTwo {
	id?: number;
	reservationId?: string;
}

function ServiceCardModalStepTwo({reservationId}: IServiceCardModalStepTwo) {
	const {selections} = useSelection();
	return (
			<div className={'w-full px-8 flex flex-col gap-y-8'}>
				{reservationId && (
						<div className={'flex items-center gap-1'}>
							<h5 className={'text-charcoal/50 text-xl'}>Reservation ID:</h5>
							<span className={'text-charcoal text-xl font-medium'}>{reservationId}</span>
						</div>
				)}
				<div className={'flex gap-4 items-center'}>
					<img className={'size-14'} src={ServiceLogo.src}/>
					<div className={'flex flex-col gap-y-0.5'}>
						<h4 className={'text-xl text-charcoal font-semibold'}>Performance Center</h4>
						<div className={'flex items-center gap-1'}>
							<img src={YellowStar.src} className={''}/>
							<h6 className={'text-charcoal text-sm font-semibold'}>4.5</h6>
						</div>
					</div>
				</div>
				<div className={'flex flex-col gap-3'}>
					<div className={'flex gap-1'}>
						<h5 className={'text-base text-charcoal/50'}>Date & Time:</h5>
						<span className={'font-medium text-base text-charcoal'}>{selections.selectedDay}, {selections.selectedTime}</span>
					</div>
					<div className={'flex gap-1'}>
						<h5 className={'text-base text-charcoal/50'}>Car and Model:</h5>
						<span className={'font-medium text-base text-charcoal'}>{selections.selectedCar}, {selections.selectedModel}</span>
					</div>
					<div className={'flex gap-1'}>
						<h5 className={'text-base text-charcoal/50'}>Service type:</h5>
						<span className={'font-medium text-base text-charcoal'}>{selections.selectedService}</span>
					</div>
					<div className={'flex gap-1'}>
						<h5 className={'text-base text-charcoal/50'}>Service location:</h5>
						<span className={'font-medium text-base text-charcoal'}>{'Baku'}</span>
					</div>
				</div>
			</div>
	)
}



type ISelections = {
	selectedCar: string
	selectedModel: string
	selectedService: string
	selectedDay: string
	selectedTime: string
}

function ServiceCardModal({selectedCardId, closeModal}: IServiceCardModal) {
	console.log('CARD MODAL RENDERED')
	const [step,setStep] = useState(1);

	return (
			<Dialog open={selectedCardId !== null}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
						<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
							{step === 1 ? "Make the reservation" : step === 2 ? "Confirm your reservation" : step === 3 && "Your reservation been made"}
						</DialogTitle>
						<DialogPrimitive.Close onClick={() => {
							closeModal()
							setTimeout(() => {
								setStep(1)
							},300)
						}}>
							<X className={'size-6 text-charcoal/50'}/>
						</DialogPrimitive.Close>
					</DialogHeader>
					<SelectionProvider>
						{step === 1 && (
								<ServiceCardModalStepOne />
						)}
						{step === 2 && (
								<ServiceCardModalStepTwo />
						)}
						{step === 3 && (
								<ServiceCardModalStepTwo reservationId={'#1234567890'} />
						)}
					</SelectionProvider>
					{step < 3 && (
							<DialogFooter className={'px-8'}>
								<Button
										onClick={() => setStep((step) => step + 1)}
										className={'bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full'}
										type="submit">
									{step === 1 ? 'Make reservation' : 'Confirm'}
								</Button>
							</DialogFooter>
					)}
				</DialogContent>
			</Dialog>
	)
}

export default memo(ServiceCardModal)
