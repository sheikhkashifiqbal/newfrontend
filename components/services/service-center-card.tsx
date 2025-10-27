'use client'
import StarIcon from '@/assets/icons/services/YellowStarIcon.svg'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface ICardHeader {
  containerClassname?: string
  branchName: string
  logoImg: string
  stars: number
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export function CardHeader({ containerClassname, branchName, logoImg, stars }: ICardHeader) {
  return (
    <div className={cn('p-4 pb-0 flex items-center gap-x-4', containerClassname)}>
      <img
        src={`${BASE_URL}/images/${logoImg}`}
        alt={`${branchName} logo`}
        className="!size-14 rounded-full object-cover"
      />
      <div className="flex flex-col gap-y-0.5">
        <h5 className="text-charcoal text-base font-semibold">{branchName}</h5>
        <div className="flex items-center gap-x-1">
          <StarIcon className="!size-5" />
          <h6 className="text-charcoal text-sm font-semibold">{stars?.toFixed(1) ?? '0.0'}</h6>
        </div>
      </div>
    </div>
  )
}

function CardBookedServices({ services }: { services: string[] }) {
  const safe = Array.isArray(services) ? services : []
  return (
    <div className="px-4 flex flex-col gap-y-3">
      <p className="text-xs font-medium text-muted-gray">Most booked service</p>
      <div className="flex flex-wrap gap-1">
        {safe.map((s) => (
          <div
            key={s}
            className="py-1.5 px-4 rounded-[52px] border-[1px] border-soft-gray text-sm text-charcoal font-medium w-fit"
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

interface IServiceCenterCard {
  id: number
  branchId: number
  isLastRow: boolean
  onClick: (branchId: number) => void
  branchName: string
  serviceNames: string[]
  branchCoverImg: string
  logoImg: string
  stars: number
}

export default function ServiceCenterCard({
  id,
  branchId,
  isLastRow,
  onClick,
  branchName,
  serviceNames,
  branchCoverImg,
  logoImg,
  stars
}: IServiceCenterCard) {
  const hasBookedServices =
    Array.isArray(serviceNames) && serviceNames.some((s) => Boolean(s) && String(s).trim() !== '')
  if (!hasBookedServices) return null

  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className={cn(isLastRow && 'h-[550px]')}>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          'max-w-[350px] 1000:max-w-[310px] xl:max-w-[290px] max-h-[460px] w-full overflow-hidden duration-700 ease-in-out rounded-3xl flex flex-col',
          isHovered && 'max-h-[520px] shadow-[0px_24px_32px_0px_#DBE2EF]'
        )}
      >
        <img
          className="rounded-t-3xl max-h-[160px] object-cover w-full"
          src={`${BASE_URL}/images/${branchCoverImg}`}
          alt={`${branchName} cover`}
        />
        <div className="flex flex-col bg-white gap-y-4">
          <CardHeader branchName={branchName} logoImg={logoImg} stars={stars} />
          <CardBookedServices services={serviceNames} />
          {/* CardFooter removed */}
        </div>

        <button
          onClick={() => onClick(branchId)}
          className={cn(
            'w-full bg-steel-blue py-3 px-6 rounded-b-3xl text-white duration-700 ease-in-out text-base font-semibold',
            isHovered ? 'max-h-[60px]' : 'max-h-[0px] p-0'
          )}
        >
          Make a reservation
        </button>
      </div>
    </div>
  )
}
