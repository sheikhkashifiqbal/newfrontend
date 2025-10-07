'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";

export default function UserSecurityDetailsTab() {
	const userSecurityDetailsFormSchema = z.object({
		oldPassword: z.string({required_error: 'old password is required'}).min(8, {message: 'old password must be at least 8 characters'}),
		newPassword: z.string({required_error: 'new password is required'}).min(8, {message: 'new password must be at least 8 characters'})
				.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/,
				"Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."),
		repeatNewPassword: z.string({required_error: 'new password repeat is required'}),
	}).refine((data) => data.newPassword === data.repeatNewPassword, {
		message: 'Passwords do not match',
		path: ['repeatNewPassword'], // This ensures the error is attached to the `repeatNewPassword` field
	});

	const form = useForm<z.infer<typeof userSecurityDetailsFormSchema>>({
		resolver: zodResolver(userSecurityDetailsFormSchema),
		mode: 'onChange'
	})

	function onSubmit(values: z.infer<typeof userSecurityDetailsFormSchema>) {
		console.log(values)
	}

	return (
			<DashboardContainer>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-5'}>
						<div className={'grid grid-cols-1 500:grid-cols-2 700:grid-cols-3 gap-4'}>
							<CustomFormField
									control={form.control}
									name={'oldPassword'}
									isItalicPlaceholder={true}
									placeholder={'type your old password'}
									label={'Old Password *'}
									inputType={'password'}
							/>

							<CustomFormField
									control={form.control}
									name={'newPassword'}
									isItalicPlaceholder={true}
									placeholder={'type your new password'}
									label={'New Password *'}
									inputType={'password'}
							/>

							<CustomFormField
									control={form.control}
									name={'repeatNewPassword'}
									isItalicPlaceholder={true}
									placeholder={'retype your new password'}
									label={'Retype new Password *'}
									inputType={'password'}
							/>
						</div>
						<CustomBlueBtn type={"submit"} className={'max-w-[154px]'} text={'Save changes'}/>
					</form>
				</Form>
			</DashboardContainer>
	)
}
