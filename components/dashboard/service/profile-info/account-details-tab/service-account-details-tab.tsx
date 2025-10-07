'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {isValidPhoneNumber} from "react-phone-number-input/min";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {CitySelector} from "@/components/services/selectors/city-selector";
import {cn} from "@/lib/utils";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import CustomFormFieldPhoneInput from "@/components/app-custom/custom-form-field-phone-input";
import CustomFormFieldFile from "@/components/app-custom/custom-form-field-file";

export default function ServiceAccountDetailsTab() {

	const fileSchema = z
			.instanceof(File, {message: 'Not a valid file format!'})
			.refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), {
				message: "Only JPEG, JPG and PNG files are allowed",
			})
			.refine((file) => file.size <= 5 * 1024 * 1024, {
				message: "File size must be less than 5MB",
			});

	const serviceAccountDetailsFormSchema = z.object({
		companyName: z.string({required_error: 'company name is required'}).min(3,{message: 'company name must be at least 3 characters'}),
		taxId: z.string({required_error: 'tax id is required'}).min(3,{message: 'tax id must be at least 3 characters'}),
		contactPersonFullName: z.string({required_error: 'full name is required'}).min(3,{message: 'full name must be at least 3 characters'}),
		contactPersonRole: z.string({required_error: 'role is required'}),
		city: z.string({required_error: 'city is required'}),
		address: z.string({required_error: 'address is required'}),
		stationaryTel: z.string({required_error: 'tel is required'}).refine(isValidPhoneNumber, {message: "Invalid phone number"}),
		mobileNum: z.string({required_error: 'mobile num is required'}).refine(isValidPhoneNumber, {message: "Invalid phone number"}),
		email: z.string({required_error: 'email is required'}).email({message: 'Invalid email address'}),
		website: z.string().min(3,{message: 'website must be at least 3 characters'}),
		logo: fileSchema,
		cover: fileSchema,
	})

	const form = useForm<z.infer<typeof serviceAccountDetailsFormSchema>>({
		resolver: zodResolver(serviceAccountDetailsFormSchema),
		mode: 'onChange'
	})


	const divGridClassname = 'grid grid-cols-1 480:grid-cols-2 600:grid-cols-3 gap-4';

	return (
			<DashboardContainer>
				<Form {...form}>
					<form className={'flex flex-col gap-y-5'}>
						<div className={'flex flex-col gap-y-6'}>
							<div className={divGridClassname}>
								<CustomFormField
									control={form.control}
									name={'companyName'}
									label={'Company name *'}
									placeholder={'Enter company name'}
									isItalicPlaceholder={true}
								/>

								<CustomFormField
										control={form.control}
										name={'taxId'}
										label={'Tax ID *'}
										placeholder={'Enter tax ID'}
										isItalicPlaceholder={true}
								/>

								<CustomFormField
										control={form.control}
										name={'contactPersonFullName'}
										label={'Contact person’s full name *'}
										placeholder={'Enter full name'}
										isItalicPlaceholder={true}
								/>
							</div>

							<div className={divGridClassname}>
								<CustomFormField
										control={form.control}
										name={'contactPersonRole'}
										label={'Contact person’s role *'}
										placeholder={'Enter role'}
										isItalicPlaceholder={true}
								/>

								<CustomFormFieldSelector
									control={form.control}
									name={'city'}
									label={'City *'}
									Children={(onChange, hasError, value) => {
										return (
												<CitySelector
														triggerClassname={cn(grayTriggerClassname, hasError && '!border-vibrant-red')}
														value={value}
														onChange={onChange}
												/>
										)
									}}
								/>
								<CustomFormField
										control={form.control}
										name={'address'}
										label={'Address *'}
										placeholder={'Enter address'}
										isItalicPlaceholder={true}
								/>
							</div>

							<div className={divGridClassname}>
								<CustomFormFieldPhoneInput
									name={'stationaryTel'}
									label={'Stasionar tel *'}
									control={form.control}
									placeholder={'Enter statianory tel'}
								/>

								<CustomFormFieldPhoneInput
										name={'mobileNum'}
										label={'Mobile *'}
										control={form.control}
										placeholder={'Enter mobile num'}
								/>

								<CustomFormField
									name={'email'}
									control={form.control}
									isItalicPlaceholder={true}
									placeholder={'Enter email address'}
									label={'E-mail address *'}
									inputType={'email'}
								/>
							</div>

							<div className={'grid grid-cols-1 480:grid-cols-2 600:grid-cols-3'}>
								<CustomFormField
										name={'website'}
										control={form.control}
										label={'Website'}
										placeholder={'Type your website'}
										isItalicPlaceholder={true}
								/>
							</div>

							<div className={'grid grid-cols-1 500:grid-cols-2 1100:grid-cols-3 gap-4'}>
								<CustomFormFieldFile
									name={'logo'}
									control={form.control}
									label={'Update company logo *'}
								/>

								<CustomFormFieldFile
										name={'cover'}
										control={form.control}
										label={'Upload company cover photo *'}
								/>
							</div>
						</div>
						<CustomBlueBtn className={'max-w-fit'} text={'Save changes'}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
