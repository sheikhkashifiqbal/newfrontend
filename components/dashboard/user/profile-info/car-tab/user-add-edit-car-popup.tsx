'use client'


import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {cn} from "@/lib/utils";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {CarSelector} from "@/components/services/selectors/car-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {CarModelSelector} from "@/components/services/selectors/car-model-selector";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {memo, useEffect} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";

interface IUserAddNewCarPopup {
	isOpen?: boolean;
	closePopup: () => void
	car?: {
		id: number;
		brand: string;
		model: string;
		vin: string;
		plateNumber: string;
	} | null
}

function UserAddEditCarPopup(
		{
			isOpen,
			closePopup,
			car
		}: IUserAddNewCarPopup
) {



	const userAddNewCarFormSchema = z.object({
		brand: z.string({required_error: "brand is required"}),
		model: z.string({required_error: "model is required"}),
		vin: z.string({required_error: "VIN is required"})
			.min(17, {message: "VIN must be exactly 17 characters"})
			.max(17, {message: "VIN must be exactly 17 characters"})
			.regex(/^[A-HJ-NPR-Z0-9]{17}$/i, {message: "VIN must contain only alphanumeric characters (excluding I, O, Q)"}),
		plateNumber: z.string({required_error: "plate number is required"}).min(5, {message: "plate number should be at least 5 characters"}),
	})

	const form = useForm<z.infer<typeof userAddNewCarFormSchema>>({
		resolver: zodResolver(userAddNewCarFormSchema),
		defaultValues: {
			brand: car?.brand,
			model: car?.model,
			vin: car?.vin,
			plateNumber: car?.plateNumber
		},
		mode: "onChange"
	})

	useEffect(() => {
		form.reset({
			brand: car?.brand,
			model: car?.model,
			vin: car?.vin,
			plateNumber: car?.plateNumber
		});
	}, [car]);


	function onPopupClose() {
		closePopup()
		setTimeout(() => {
			form.reset()
		},250)
	}


	function onSubmit(values: z.infer<typeof userAddNewCarFormSchema>) {
		console.log(values)
		onPopupClose()
	}


	return (
			<Dialog open={isOpen}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[520px]  max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[600px]'}>
						<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
								Add New Vehicle
							</DialogTitle>
							<DialogPrimitive.Close onClick={() => {
								onPopupClose()
							}}>
								<X className={'size-6 text-charcoal/50'}/>
							</DialogPrimitive.Close>
						</DialogHeader>


						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 flex flex-col gap-y-8'}>
								<CustomFormFieldSelector
										control={form.control}
										name={'brand'}
										label={'Brand'}
										Children={(onChange, hasError, value) => <CarSelector triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')} showMyCars={false} value={value} onChange={onChange}/>}
								/>

								<CustomFormFieldSelector
										control={form.control}
										name={'model'}
										label={'Model'}
										Children={(onChange, hasError, value) => <CarModelSelector triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')} value={value} brandId={0} onChange={onChange}/>}
								/>

								<CustomFormField
										control={form.control}
										name={'vin'}
										label={'VIN'}
										isItalicPlaceholder={true}
										placeholder={'input your VIN number'}
								/>

								<CustomFormField
										control={form.control}
										name={'plateNumber'}
										label={'Plate number'}
										isItalicPlaceholder={true}
										placeholder={'11-OO-111'}
								/>

								<CustomBlueBtn type={"submit"} text={car ? "Update" : "Add"}/>
							</form>
						</Form>
					</ScrollArea>
				</DialogContent>
			</Dialog>
	)
}

export default memo(UserAddEditCarPopup)
