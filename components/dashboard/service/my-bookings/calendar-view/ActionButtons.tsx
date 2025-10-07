'use client'

import PlusIcon from '@/assets/icons/register/PlusIcon.svg'
import SlashCircleIcon from '@/assets/icons/dashboard/slash-circle.svg'

interface IActionButtons {
	onReserveClick?: () => void;
}

export default function ActionButtons({onReserveClick}: IActionButtons) {
	return (
			<div className={'hidden h-[6.75rem] duration-700 w-full group-hover:flex gap-2'}>
				<div onClick={onReserveClick} className={'cursor-pointer flex basis-1/2 items-center justify-center flex-col gap-2 bg-steel-blue/10 rounded-2xl p-4 h-full'}>
					<PlusIcon className={'!size-5 text-steel-blue'}/>
					<h6 className={'max-w-[8ch] text-center text-wrap text-steel-blue text-xs font-medium'}>
						Add new reservation
					</h6>
				</div>

				<div className={'cursor-pointer flex basis-1/2 items-center justify-center flex-col gap-2 bg-danger-red/10 rounded-2xl p-4 h-full'}>
					<SlashCircleIcon className={'!size-5'}/>
					<h6 className={'max-w-[8ch] text-center text-wrap  text-bold-red text-xs font-medium'}>
						Make unavailable
					</h6>
				</div>
			</div>
	)
}
