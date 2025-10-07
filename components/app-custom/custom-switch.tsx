'use client'
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {cn} from "@/lib/utils";


interface ICustomSwitch {
	label?: string
	labelClassname?: string
	id: string
	checked?: boolean
	onChecked?: (checked: boolean) => void
}

export function CustomSwitch({id, label, labelClassname, checked, onChecked}: ICustomSwitch) {
	return (
			<div className="flex items-center gap-3">
				<Switch
						id={id}
						checked={checked}
						onCheckedChange={onChecked}
				/>
				{label &&
            <Label className={cn('text-dark-gray text-sm font-medium', labelClassname)} htmlFor={id}>{label}</Label>
				}
			</div>
	)
}
