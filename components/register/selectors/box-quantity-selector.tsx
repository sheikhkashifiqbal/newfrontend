'use client'
import {useState} from "react";
import MinusIcon from '@/assets/icons/register/MinusIcon.svg'
import PlusIcon from '@/assets/icons/register/PlusIcon.svg'



interface IBoxQuantitySelector {
  onChange: (value: number) => void
  value: number
}
export default function BoxQuantitySelector({
  onChange,
  value
}: IBoxQuantitySelector) {
  // Coerce to a safe integer each render
  const numeric = Number.parseInt(String(value ?? ""), 10);
  // If invalid or <1, fall back to 1 (matches your zod min(1))
  const safeValue = Number.isFinite(numeric) && numeric >= 1 ? numeric : 1;

  // If you want to allow decrement down to 0 instead of 1, flip minBound to 0.
  const minBound = 1; // <-- change to 0 if you want 0 allowed

  const handleDecrement = () => {
    const next = Math.max(minBound, safeValue - 1);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = safeValue + 1;
    onChange(next);
  };

  return (
    <div className={'h-14 max-w-[144px] flex items-center justify-between bg-white border border-soft-gray py-3 px-4 rounded-[12px]'}>

      <div
        className={'cursor-pointer size-6 flex items-center justify-center'}
        onClick={handleDecrement}
        role="button"
        aria-label="Decrease"
      >
        
		<img src="/icons/register/MinusIcon.svg" alt="minus" />
      </div>

      <div className={'flex items-center justify-center size-8 h-6 text-charcoal text-base font-medium'}>
        {safeValue}
      </div>

      <div
        className={'cursor-pointer size-6 flex items-center justify-center'}
        onClick={handleIncrement}
        role="button"
        aria-label="Increase"
      >
        <img src="/icons/register/PlusIcon.svg" alt="plus" width="50%" />
      </div>

    </div>
  )
}

