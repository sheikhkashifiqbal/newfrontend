'use client'
import StarIcon from '@/assets/icons/services/YellowStarIcon.svg'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface ICardHeader {
  containerClassname?: string
  branchName: string
  logoImg: string
  stars: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function CardHeader({ containerClassname, branchName, logoImg, stars }: ICardHeader) {
  return (
    <div className={cn('p-4 pb-0 flex items-center gap-x-4', containerClassname)}>
      {/* ✅ Dynamic logo */}
      <img
        src={`${BASE_URL}/images/${logoImg}`}
        alt={`${branchName} logo`}
        className={'!size-14 rounded-full object-cover'}
      />
      <div className={'flex flex-col gap-y-0.5'}>
        {/* ✅ Dynamic branch name */}
        <h5 className={'text-charcoal text-base font-semibold'}>{branchName}</h5>
        <div className={'flex items-center gap-x-1'}>
          <StarIcon className={'!size-5'} />
          {/* ✅ Dynamic star rating */}
          <h6 className={'text-charcoal text-sm font-semibold'}>
            {stars ? stars.toFixed(1) : '0.0'}
          </h6>
        </div>
      </div>
    </div>
  )
}
