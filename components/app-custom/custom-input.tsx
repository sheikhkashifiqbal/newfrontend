'use client'
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import {HTMLInputTypeAttribute, useEffect, useState} from "react";
import EyeIcon from '@/assets/icons/register/Eye.svg'
import EyeOffIcon from '@/assets/icons/register/EyeOff.svg'
import * as React from "react";

interface ICustomInput {
	placeholder?: string
	className?: string
	value: string
	onChange?: (value: string) => void
	inputType?: HTMLInputTypeAttribute
	isItalicPlaceholder?: boolean
}

export default function CustomInput(
		{
				placeholder = 'placeholder',
				className,
				value,
				onChange,
				inputType = 'text',
				isItalicPlaceholder = false,
		}: ICustomInput
) {
	const [isPasswordInput,setIsPasswordInput] = useState(false);
	const [type,setType] = useState<HTMLInputTypeAttribute>();
	useEffect(() => {
		setType(inputType)
		if(inputType === 'password') {
			setIsPasswordInput(true)
		}
	}, [inputType])
	return (
			<div className={'h-fit relative'}>
				<Input
						min={1}
						type={type}
						value={value}
						onChange={(event) => {
							onChange && onChange(event.target.value)
						}}
						placeholder={placeholder}
						className={cn('h-auto text-charcoal text-base py-3 px-4 bg-white border border-soft-gray placeholder:text-sm font-medium placeholder:text-misty-gray rounded-[12px] focus:border-steel-blue/20 focus:shadow-[0px_0px_16px_0px_#3F72AF1A]',className, isItalicPlaceholder && 'placeholder:italic', isPasswordInput && 'pr-10')}
				/>
				{isPasswordInput && type === "password" && (
						<div onClick={() => setType("text")} className={'size-fit absolute right-2 top-[calc(50%-0.75rem)]'}>
							<EyeOffIcon className={'!size-6'} />
						</div>
				)}
				{isPasswordInput && type === "text" && (
						<div onClick={() => setType("password")} className={'size-fit absolute right-2 top-[calc(50%-0.75rem)]'}>
							<EyeIcon className={'!size-6'} />
						</div>
				)}
			</div>
	)
}
