"use client"
import {memo, useEffect, useState} from "react";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {X} from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { z } from "zod"
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import UserIcon from '@/assets/icons/login/user-icon.svg'
import ServiceIcon from '@/assets/icons/login/service-icon.svg'
import StoreIcon from '@/assets/icons/login/store-icon.svg'
import {cn} from "@/lib/utils";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import CustomOtp from "@/components/app-custom/custom-otp";

import { useRouter } from "next/navigation";
import { toast } from "sonner"; // make sure to install and configure 'sonner'


interface ILoginPopupModal {
	isOpen: boolean
	setIsOpen: (open: boolean) => void
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type AccountTypesT = {
	value: "user" | "service" | "store"
	text: string
	icon: any
}

function AccountTypesContainer(
		{
				form,
				accountTypeLive
		}: {
			form: any
			accountTypeLive: "user" | "service" | "store"
		}
) {


	const accountTypes: AccountTypesT[]  = [
		{
			value: "user",
			text: "User",
			icon: UserIcon,
		},
		{
			value: "service",
			text: "Service",
			icon: ServiceIcon
		},
		{
			value: "store",
			text: "Store",
			icon: StoreIcon
		}
	]
	return (
			<div className={'grid grid-cols-3 gap-2'}>
				{accountTypes.map((t) => {
					const IconComponent = t.icon;
					return (
							<div
									onClick={() => form.setValue('accountType', t.value)}
									className={cn('cursor-pointer bg-white/50 rounded-[12px] py-3 px-5 flex justify-center items-center gap-x-[14px]', t.value === accountTypeLive && 'bg-white border border-steel-blue/20')} key={t.value}>
								<IconComponent className={'size-6'}/>
								<h4 className={'text-charcoal text-base font-medium'}>{t.text}</h4>
							</div>
					)
				})}
			</div>
	)
}

function MainScreen({ setPage }: { setPage: (page: 1 | 2) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const mainScreenFormSchema = z.object({
    accountType: z.enum(["user", "service", "store"]),
    email: z.string({ required_error: "Email is required" }).email({ message: "Invalid email format" }),
    password: z.string({ required_error: "Password is required" }).min(2, "password should be at least 2 characters length")
  });

  const form = useForm<z.infer<typeof mainScreenFormSchema>>({
    resolver: zodResolver(mainScreenFormSchema),
    defaultValues: {
      accountType: "user",
      email: undefined,
      password: undefined
    },
    mode: "onChange"
  });

  const accountTypeLive = form.watch('accountType');

  async function onSubmit(values: z.infer<typeof mainScreenFormSchema>) {
    setIsLoading(true);
    try {
      // Map UI selection to backend 'type'
      // userIcon -> "user"; serviceIcon/storeIcon -> "branch_manager"
      const loginType = values.accountType === "user" ? "user" : "branch_manager";

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          type: loginType, // ✅ NEW parameter
        }),
      });

      if (!res.ok) {
      //  throw new Error("Invalid login credentials");
      }

      const data = await res.json();

      // ✅ Persist the entire response and the role
      localStorage.setItem("auth_response", JSON.stringify(data));
      localStorage.setItem("auth_role", loginType);

      toast.success("Login successful");
      router.push("/services");
    } catch (err: any) {
      console.error("Login failed:", err);
      toast.error("Login failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const PasswordFieldLabel = () => (
    <h4 onClick={() => setPage(2)} className={'cursor-pointer text-royal-blue text-sm font-medium'}>
      Forgot password?
    </h4>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-8 px-8'}>
        <AccountTypesContainer form={form} accountTypeLive={accountTypeLive} />
        <CustomFormField
          control={form.control}
          name={"email"}
          placeholder={"E-mail address"}
          label={'Your e-mail'}
          inputType={"email"}
        />
        <CustomFormField
          control={form.control}
          name={"password"}
          placeholder={"Your password"}
          label={"Password *"}
          rightMostLabel={<PasswordFieldLabel />}
          inputType={'password'}
        />
        <CustomBlueBtn text={"Log in"} />
        <div className={'px-6 flex items-center justify-center gap-2'}>
          <h4 className={'text-base font-medium text-charcoal'}>Don't have an account?</h4>
          <Link className={'text-base font-semibold text-royal-blue'} href={'/register'}>Sign up</Link>
        </div>

        {/* Remember Me */}
        <div className='flex items-center gap-2'>
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe(!rememberMe)}
            className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
          />
          <label htmlFor="rememberMe" className='text-sm text-gray-700'>Remember me</label>
        </div>

        <div className={'px-6 flex items-center justify-center gap-2'}>
          <h4 className={'text-base font-medium text-charcoal'}>Don't have an account?</h4>
          <Link className={'text-base font-semibold text-royal-blue'} href={'/register'}>Sign up</Link>
        </div>
      </form>
    </Form>
  );
}


function ForgotPasswordScreen({setPage}: {setPage: (page: 1 | 2 | 3) => void}) {
	const forgotPasswordFormSchema = z.object({
		accountType: z.enum(["user", "service", "store"]),
		phoneNumber: z.string({required_error: "mobile number is required"}).min(7, "mobile number should be minimum of 7 chars")
	})

	const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
		resolver: zodResolver(forgotPasswordFormSchema),
		defaultValues: {
			accountType: "user",
			phoneNumber: undefined
		},
		mode: "onChange"
	})

	const accountTypeLive = form.watch('accountType');

	function onSubmit(values: z.infer<typeof forgotPasswordFormSchema>) {
		console.log(values)
	}

	return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-8 px-8'}>
					<AccountTypesContainer form={form} accountTypeLive={accountTypeLive} />
					<CustomFormField
						control={form.control}
						name={"phoneNumber"}
						label={"Your mobile number"}
						placeholder={"+994"}
						inputType={"tel"}
					/>
					<CustomBlueBtn onClick={() => setPage(3)} text={"Reset password"}/>
					<Button onClick={() => setPage(1)} className={'py-3 px-6 bg-inherit border-0 flex items-center justify-center text-charcoal text-base font-medium'}>
						Back to log in
					</Button>
				</form>
			</Form>
	)
}

function OTPScreen({setPage}: {setPage: (page: 1 | 2 | 3 | 4) => void}) {
	const [resendCount, setResendCount] = useState(0);
	const [sec,setSec] = useState(5);
	useEffect(() => {
		console.log(1)
		const timer = setInterval(() => {
			setSec((prev) => {
				if(prev === 1) {
					clearInterval(timer)
				}
				return prev - 1;
			});
		}, 1000)

		return () => {
			clearInterval(timer)
		}
	},[resendCount])

	const handleResendOTP = () => {
		setSec(5); // Reset the countdown
		setResendCount((prev) => prev+1); // Trigger the countdown
		// Add logic to resend OTP here
	};

	return (
			<div className={'flex flex-col gap-y-8 px-8'}>
				<div className={'flex items-center justify-center'}>
					<CustomOtp />
				</div>
				<CustomBlueBtn onClick={() => setPage(4)} text={'Submit'} />
					{sec === 0 ? (
						<Button onClick={handleResendOTP} className={'bg-inherit text-center text-sm text-charcoal/40'}>
							Send again
						</Button>
					) : (
							<h4 className={'text-center text-sm text-charcoal/40'}>
								Resend the code in 00:{sec.toString().padStart(2, "0")}
							</h4>
					)}
			</div>
	)
}


function ResetPasswordScreen({closeModal}: {closeModal: () => void}) {
	const resetPasswordFormSchema = z.object({
		password: z.string({required_error: "password is required"}).min(8, "password should be minimum of 8 chars"),
		passwordRepeat: z.string({required_error: "confirm password is required"}),
	})
			.refine((data) => data.password === data.passwordRepeat, {
				message: 'Passwords do not match',
				path: ['passwordRepeat'], // This ensures the error is attached to the `passwordRepeat` field
			});

	const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: {
			password: undefined,
			passwordRepeat: undefined
		},
		mode: "onChange"
	})


	function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
		console.log(values)
	}

	return (
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className={'flex flex-col gap-y-8 px-8'}>
					<CustomFormField
							control={form.control}
							name={"password"}
							label={"Password *"}
							placeholder={"Your password"}
							inputType={"password"}
					/>
					<CustomFormField
							control={form.control}
							name={"passwordRepeat"}
							label={"Confirm password *"}
							placeholder={"Your password"}
							inputType={"password"}
					/>
					<CustomBlueBtn onClick={closeModal} text={"Confirm"}/>
				</form>
			</Form>
	)
}

function LoginPopupModal(
		{
				isOpen,
				setIsOpen
		}: ILoginPopupModal
) {
	const [page, setPage] = useState(1);

	function closeModal() {
		setIsOpen(false)
		setTimeout(() => {
			setPage(1)
		}, 300)
	}

	return (
			<Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
				<DialogContent className={cn('flex flex-col gap-y-8 py-8 max-w-[600px] bg-light-gray rounded-3xl', page === 3 && 'max-w-[350px]')}>
					<DialogHeader className={'p-8 pt-0 border-b border-b-blue-gray flex justify-between'}>
						<DialogTitle className={'flex flex-col gap-2 text-charcoal text-2xl font-medium'}>
							{page === 1 ? "Log in to your account" : page === 2 ? (
									<>
										Forgot the password?
										<p className={'text-sm text-slate-gray/50'}>
											No worries, we will send you reset instructions.
										</p>
									</>
							) : page === 3 ? (
									<>
										Enter the code
										<p className={'text-charcoal/50 text-sm'}>
											Please enter the 4 digit code we sent to kamran.rustemli@gmail.com
										</p>
									</>
							) : (
									<>
										Set new password
										<p className={'text-charcoal/50 text-sm'}>Must be at least 8 characters</p>
									</>
							)}
						</DialogTitle>
						<DialogPrimitive.Close onClick={closeModal}>
							<X className={'size-6 text-charcoal/50'}/>
						</DialogPrimitive.Close>
					</DialogHeader>
					{page === 1 && <MainScreen setPage={setPage} />}
					{page === 2 && <ForgotPasswordScreen setPage={setPage} />}
					{page === 3 && <OTPScreen setPage={setPage}/>}
					{page === 4 && <ResetPasswordScreen closeModal={closeModal}/>}
				</DialogContent>
			</Dialog>
	)
}
export default memo(LoginPopupModal);
