'use client'

import {Checkbox} from "@/components/ui/checkbox";
import {cn} from "@/lib/utils";

interface ICustomCheckbox {
	label?: string,
	id: string
	labelClassname?: string
	value?: string
	checked?: boolean
	onChange?: (state: boolean, value: string) => void
}

export default function CustomCheckbox(
		{
				label = "label",
				id,
				labelClassname,
				checked,
				onChange,
				value
		}: ICustomCheckbox
) {
	return (
			<div className="flex items-center space-x-2">
				<Checkbox checked={checked} onCheckedChange={(checked) => onChange && onChange(!!checked, value ? value : "")} className={"size-5 rounded-[4px] checked:bg-royal-blue"} id={id} />
				<label
						htmlFor={id}
						className={cn("text-charcoal font-medium text-base", labelClassname)}
				>
					{label}
				</label>
			</div>
	)
}
