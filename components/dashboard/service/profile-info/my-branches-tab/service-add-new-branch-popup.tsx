'use client'


import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn} from "@/lib/utils";
import {ScrollArea} from "@/components/ui/scroll-area";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import * as React from "react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {
	serviceBranchFormSchema
} from "@/components/dashboard/service/profile-info/my-branches-tab/service-my-branches-tab";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import WorkDaysSelector from "@/components/register/selectors/work-days-selector";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import WorkHoursSelector from "@/components/register/selectors/work-hours-selector";
import CustomFormFieldFile from "@/components/app-custom/custom-form-field-file";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";


interface IServiceAddNewBranchPopup {
	isOpen?: boolean;
	closePopup: () => void;
}

export default function ServiceAddNewBranchPopup({
		isOpen,
		closePopup
																								 }:IServiceAddNewBranchPopup ) {



	const form = useForm<z.infer<typeof serviceBranchFormSchema>>({
		resolver: zodResolver(serviceBranchFormSchema),
		defaultValues: {
			workHours: [],
			workDays: []
		},
		mode: 'onChange'
	})


	function onSubmit(values: z.infer<typeof serviceBranchFormSchema>) {
		console.log(values)
	}

	const divGridClassname = 'grid grid-cols-1 650:grid-cols-2 gap-6'

	return (
			<Dialog open={isOpen}>
				<DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
					<ScrollArea className={'h-[450px] 650:h-[600px]'}>
						<DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0'}>
							<div className={'flex justify-between items-center'}>
								<DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
									Add new branch
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
							<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-4 pt-8 px-8'}>
								<CustomFormField
										isItalicPlaceholder={true}
										control={form.control}
										name={'name'}
										placeholder={'ex., Shamakhi branch'}
										label={'Branch name *'}
								/>

								<div className={divGridClassname}>
									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'code'}
											placeholder={'ex., Shamakhi branch'}
											label={'Branch code *'}
									/>

									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'managerName'}
											placeholder={'Enter branch manager’s name'}
											label={'Branch manager’s name *'}
									/>
								</div>

								<div className={divGridClassname}>
									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'address'}
											placeholder={'Type your address'}
											label={'Address *'}
									/>

									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'location'}
											placeholder={'Select your location'}
											label={'Location *'}
									/>
								</div>

								<div className={divGridClassname}>
									<CustomFormFieldSelector
											name={`workDays`}
											isItalicPlaceholder={true}
											placeholder={"Select the workdays"}
											label={"Workdays *"}
											control={form.control}
											Children={(onChange, hasError, value) => <WorkDaysSelector form={form} value={value} onChange={onChange}/>}
									/>

									<CustomFormFieldSelector
											name={`workHours`}
											isItalicPlaceholder={true}
											placeholder={"Select your working hours"}
											label={"Working hours *"}
											control={form.control}
											Children={(onChange, hasError, value) => <WorkHoursSelector form={form} value={value} onChange={onChange}/>}
									/>
								</div>

								<div className={divGridClassname}>
									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'email'}
											placeholder={'Type email'}
											label={'Login e-mail for branch *'}
									/>

									<CustomFormField
											isItalicPlaceholder={true}
											control={form.control}
											name={'password'}
											placeholder={'Type password'}
											label={'Login password for branch *'}
									/>
								</div>

								<div className={divGridClassname}>
									<CustomFormFieldFile
										control={form.control}
										name={'logo'}
										label={'Upload branch logo *'}
									/>

									<CustomFormFieldFile
											control={form.control}
											name={'cover'}
											label={'Upload branch cover *'}
									/>
								</div>

								<CustomBlueBtn text={'Save branch'}/>
							</form>
						</Form>
					</ScrollArea>
				</DialogContent>
			</Dialog>
	)
}
