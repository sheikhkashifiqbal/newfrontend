'use client'


import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldDatePicker from "@/components/app-custom/custom-form-field-date-picker";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {GenderSelector} from "@/components/register/selectors/gender-selector";
import {cn} from "@/lib/utils";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import {useForm} from "react-hook-form";

export default function UserAccountTab() {

	const userAccountDetailsFormSchema = z.object({
		name: z.string({required_error: "name is required"}).min(3, {message: "name must be at least 3 characters"}),
		surname: z.string({required_error: "surname is required"}).min(3, {message: "surname must be at least 3 characters"}),
		birthday: z.date({required_error: 'birthday is required'}),
		gender: z.string({required_error: 'gender is required'}),
		email: z.string({required_error: 'email is required'}).email({message: 'provide a valid email address'})
	})

	const form = useForm<z.infer<typeof userAccountDetailsFormSchema>>({
		resolver: zodResolver(userAccountDetailsFormSchema),
		defaultValues: {
			name: undefined,
			surname: undefined,
			birthday: undefined,
			gender: undefined,
			email: undefined
		},
		mode: "onChange"
	})

	function onSubmit(values: z.infer<typeof userAccountDetailsFormSchema>) {
		console.log(values)
	}


	return (
			<DashboardContainer>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-5'}>
						<div className={'grid grid-cols-1 500:grid-cols-2 600:grid-cols-3 lg:grid-cols-4 gap-4'}>
							{/*Name input*/}
							<CustomFormField
									control={form.control}
									name={'name'}
									label={'Name'}
									isItalicPlaceholder={true}
									placeholder={'input your name'}
							/>

							{/*Surname input*/}
							<CustomFormField
									control={form.control}
									name={'surname'}
									label={'Surname'}
									isItalicPlaceholder={true}
									placeholder={'input your surname'}
							/>

							{/*Birthday input*/}
							<CustomFormFieldDatePicker
									control={form.control}
									name={'birthday'}
									label={'Birthday'}
									placeholder={'input your birthday'}
									isItalicPlaceholder={true}
							/>

							{/*	Gender selection*/}
							<CustomFormFieldSelector
								control={form.control}
								name={'gender'}
								label={'Gender'}
								isItalicPlaceholder={true}
								Children={(onChange, hasError, value) => <GenderSelector triggerClassname={cn('!h-14',grayTriggerClassname, hasError && '!border-vibrant-red')} value={value} onChange={onChange} placeholder={'Select your gender'}/>}
							/>

							{/*	Email input*/}
							<CustomFormField
									control={form.control}
									name={'email'}
									label={'E-mail address'}
									isItalicPlaceholder={true}
									placeholder={'input your email'}
									inputType={"email"}
							/>
						</div>
						<CustomBlueBtn className={'max-w-[154px]'} type={"submit"} text={"Save changes"}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
