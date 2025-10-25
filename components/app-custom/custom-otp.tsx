'use client'
import { memo } from 'react'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'

type CustomOtpProps = {
  /** Current 4-digit value (controlled) */
  value?: string
  /** Called whenever the OTP changes (controlled) */
  onChange?: (value: string) => void
  /** Optional: disable input */
  disabled?: boolean
}

function CustomOtp({ value = '', onChange, disabled = false }: CustomOtpProps) {
  const slotClassname =
    'w-12 h-16 border rounded-[12px] border-steel-blue font-medium text-3xl text-steel-blue'

  return (
    <InputOTP
      value={value}
      onChange={onChange}
      maxLength={4}
      inputMode="numeric"
      pattern="\d*"
      disabled={disabled}
    >
      <InputOTPGroup className="flex gap-x-4">
        <InputOTPSlot className={slotClassname} index={0} />
        <InputOTPSlot className={slotClassname} index={1} />
        <InputOTPSlot className={slotClassname} index={2} />
        <InputOTPSlot className={slotClassname} index={3} />
      </InputOTPGroup>
    </InputOTP>
  )
}

export default memo(CustomOtp)
