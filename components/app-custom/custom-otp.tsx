'use client'
import {memo} from "react";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp"


function CustomOtp() {
	const slotClassname = 'w-12 h-16 border rounded-[12px] border-steel-blue font-medium text-3xl text-steel-blue';
	return (
			<InputOTP maxLength={6}>
				<InputOTPGroup className={'flex gap-x-4'}>
					<InputOTPSlot className={slotClassname} index={0} />
					<InputOTPSlot className={slotClassname} index={1} />
					<InputOTPSlot className={slotClassname} index={2} />
					<InputOTPSlot className={slotClassname} index={3} />
				</InputOTPGroup>
			</InputOTP>

	)
}

export default memo(CustomOtp)
