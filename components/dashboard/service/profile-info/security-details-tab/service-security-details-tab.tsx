'use client'

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";

export default function ServiceSecurityDetailsTab() {

	const serviceSecurityFormSchema = z.object({
		oldPassword: z
				.string({ required_error: "old password is required" })
				.min(8, { message: "old password must be at least 8 characters" }),

		newPassword: z
				.string({ required_error: "new password is required" })
				.min(8, { message: "new password must be at least 8 characters" }),

		newPasswordRepeat: z
				.string({ required_error: "new password confirmation is required" })
	}).refine((data) => data.newPassword === data.newPasswordRepeat, {
		message: "New passwords don't match",
		path: ["newPasswordRepeat"], // Show error on `newPasswordRepeat`
	});






	const form = useForm<z.infer<typeof serviceSecurityFormSchema>>({
		resolver: zodResolver(serviceSecurityFormSchema),
		defaultValues: {
			oldPassword: "",
			newPassword: "",
			newPasswordRepeat: ""
		},
		mode: 'onChange',
		// reValidateMode: 'onChange'
	})


	const onSubmit = (values: z.infer<typeof serviceSecurityFormSchema>) => {
		console.log("Form submitted:", values);
	};


	// console.log(form.formState.errors)

	return (
			<DashboardContainer>
				<Form  {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-5'}>
						<div className={'grid grid-cols-1 450:grid-cols-2 650:grid-cols-3 gap-4'}>
							<CustomFormField
								name={'oldPassword'}
								control={form.control}
								isItalicPlaceholder={true}
								inputType={'password'}
								label={'Old password *'}
								placeholder={'Type old password'}
							/>

							<CustomFormField
									name={'newPassword'}
									control={form.control}
									isItalicPlaceholder={true}
									inputType={'password'}
									label={'Type new password *'}
									placeholder={'Type new password'}
							/>

							<CustomFormField
									name={'newPasswordRepeat'}
									control={form.control}
									isItalicPlaceholder={true}
									inputType={'password'}
									label={'Retype new password *'}
									placeholder={'retype new password'}
							/>
						</div>

						<CustomBlueBtn className={'max-w-fit'} text={'Save password'}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
