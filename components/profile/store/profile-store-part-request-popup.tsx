'use client'


import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {ServiceSelector} from "@/components/services/selectors/service-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {CarPartStateSelector} from "@/components/spare-parts/spare-parts-search-results/car-part-state-selector";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";

interface IProfileStorePartRequestPopup {
	storeId?: number | null;
	closePopup: () => void;
}

export default function ProfileStorePartRequestPopup(
		{
				storeId,
				closePopup
		}: IProfileStorePartRequestPopup
) {

	const sparePartRequestFormSchema = z.object({
		vin: z.number({required_error: 'vin number is required'}).min(5, {message: 'vin should be at least 5 characters'}),
		category: z.string({required_error: 'part category is required'}),
		state: z.string({required_error: 'part state is required'}),
		parts: z.array(z.object({
			name: z.string({required_error: 'part name is required'}),
			count: z.number().min(1),
		}))
	})

	const form = useForm<z.infer<typeof sparePartRequestFormSchema>>({
		resolver: zodResolver(sparePartRequestFormSchema),
		defaultValues: {
			parts: [{
				name: "",
				count: 1
			}]
		}
	})

	const {fields, append, remove} = useFieldArray({
		control: form.control,
		name: 'parts'
	})

		return (
				<Dialog open={!!storeId}>
					<DialogContent className={cn("overflow-hidden max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
						<DialogHeader className={'w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
								Send spare part request
							</DialogTitle>
							<DialogPrimitive.Close onClick={() => {
								closePopup()
								setTimeout(() => {
									form.reset()
								},300)
							}}>
								<X className={'size-6 text-charcoal/50'}/>
							</DialogPrimitive.Close>
						</DialogHeader>

						<Form {...form}>
							<form className={'px-8 flex flex-col gap-y-8'}>
								<div className={'grid grid-cols-3 gap-6'}>
									<CustomFormField
										control={form.control}
										name={'vin'}
										label={'VIN Number *'}
										placeholder={'Enter VIN number'}
										isItalicPlaceholder={true}
									/>

									<CustomFormFieldSelector
											control={form.control}
											name={'category'}
											label={'Part Category *'}
											Children={(onChange, hasError, value) => {
												return (
														<ServiceSelector
															onChange={onChange}
															value={value}
															triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														/>
												)
											}}
									/>

									<CustomFormFieldSelector
											control={form.control}
											name={'state'}
											label={'Part State'}
											Children={(onChange, hasError, value) => {
												return (
														<CarPartStateSelector
																onChange={onChange}
																value={value}
																triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														/>
												)
											}}
									/>
								</div>

								<div className={'flex flex-col gap-y-4'}>
									{fields.map((field, index) => {
										return (
												<div className={'flex items-center gap-x-6'} key={field.id}>

												</div>
										)
									})}
								</div>

								<CustomBlueBtn text={'Send request'}/>
							</form>
						</Form>
					</DialogContent>
				</Dialog>
		)
}
