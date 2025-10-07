import {ISelectExt, SelectExt} from "@/components/shadcn-extended/SelectExt";
import {cn} from "@/lib/utils";
import {SelectItem, SelectLabel} from "@/components/ui/select";
import {ReactNode} from "react";



interface ICustomSelectLabel {
	children: ReactNode
	className?: string
}
export function CustomSelectLabel({children, className}: ICustomSelectLabel) {
	const labelClassname = 'text-xs text-charcoal/50'
	return (
			<SelectLabel className={cn(labelClassname, className)}>{children}</SelectLabel>
	)
}

interface ICustomSelectItem {
	value: string;
	children: ReactNode
	className?: string
}

export const selectTriggerClassname = 'py-3 pl-5 pr-4 rounded-[8px] text-charcoal text-base font-medium';

export function CustomSelectItem({value,children,className}:ICustomSelectItem) {
	const itemClassname = 'text-base text-charcoal font-medium'
	return (
			<SelectItem className={cn(itemClassname, className)} value={value}>{children}</SelectItem>
	)
}

export default function CustomSelect({contentClassname,triggerClassname,placeholder, children, value, onChange, iconClassname}: ISelectExt) {
	return (
			<SelectExt iconClassname={iconClassname} value={value} onChange={onChange && onChange} contentClassname={cn('bg-white rounded-[8px]', contentClassname)} triggerClassname={cn(selectTriggerClassname, triggerClassname)} placeholder={placeholder}>
				{children}
			</SelectExt>
		)
}
