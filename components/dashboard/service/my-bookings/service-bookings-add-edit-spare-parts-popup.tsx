'use client'



import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {PlusIcon, X} from "lucide-react";
import * as React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {cn} from "@/lib/utils";
import {z} from "zod";
import {useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import CustomFormField from "@/components/app-custom/CustomFormField";
import {Form} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {useEffect} from "react";

interface IServiceBookingsAddEditSpareParts {
	selectedRow?: number | null
	closePopup: () => void
}

export default function ServiceBookingsAddEditSparePartsPopup({selectedRow, closePopup}: IServiceBookingsAddEditSpareParts) {

	const addEditSparePartsFormSchema = z.object({
		parts: z.array(z.object({
			name:  z.string({required_error: "name is required"}).nonempty({message: "name is required"}),
			quantity: z.number({required_error: "qty. is required"}).min(1, {message: 'qty. should be at least 1'})
		}, {required_error: 'Define at least 1 part'})).min(1)
	})

	const form = useForm<z.infer<typeof addEditSparePartsFormSchema>>({
		resolver: zodResolver(addEditSparePartsFormSchema),
		defaultValues: {
			parts: [{}]
		},
		mode: 'onChange'
	})

	const { fields, append, remove } = useFieldArray({
		control: form.control,
		name: 'parts'
	})


	function onSubmit(values: z.infer<typeof addEditSparePartsFormSchema>) {
		console.log(values)
	}


	return (
			<Dialog open={!!selectedRow}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[520px] max-h-[450px] 650:max-h-[550px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[550px]'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									Required spare part
								</DialogTitle>
								<DialogPrimitive.Close onClick={() => {
									closePopup()
									setTimeout(() => {
										form.reset()
									},300)
								}}>
									<X className={'size-6 text-charcoal/50'}/>
								</DialogPrimitive.Close>
							</div>
						</DialogHeader>

						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 pt-8 flex flex-col gap-y-4'}>
								<div className={'max-w-fit bg-ice-mist rounded-[8px] py-2 px-4 border border-soft-sky'}>Engine</div>
								<div className={'flex flex-col gap-y-4'}>
									{fields.map((field, index) => {
										return (
												<div className={'flex gap-4'} key={field.id}>
													<CustomFormField
															name={`parts.${index}.name`}
															control={form.control}
															isItalicPlaceholder={true}
															label={'Part name'}
															placeholder={'Enter part name'}
															containerClassname={'basis-[60%]'}
													/>

													<CustomFormField
															name={`parts.${index}.quantity`}
															control={form.control}
															isItalicPlaceholder={true}
															label={'Qty.'}
															placeholder={'Ex: 100'}
															containerClassname={'basis-[30%]'}
															inputType={'number'}
													/>

													<div className={'flex flex-col gap-y-3 basis-[10%]'}>
														<h5 className={'text-dark-gray text-sm font-medium'}>Delete</h5>
														<div onClick={() => {
															if(fields.length > 1) remove(index)
														}} className={'cursor-pointer flex items-center justify-center h-14 rounded-xl border border-soft-gray bg-white px-4'}>
															<X className={'text-[#AEA8A8] size-6'}/>
														</div>
													</div>
												</div>
										)
									})}
								</div>
								<Button type={"button"} onClick={() => {
									// @ts-ignore
									append({})
								}} className={'max-w-fit flex items-center rounded-[8px] py-3 px-4 bg-soft-gray'}>
									<PlusIcon className={'text-dark-gray text-base'}/>
									<h6 className={'text-xs font-medium text-dark-gray'}>Add spare part</h6>
								</Button>

								<CustomBlueBtn type={"submit"} text={"Add Spare Parts"}/>
							</form>
						</Form>
					</ScrollArea>
				</DialogContent>
			</Dialog>
	)
}
