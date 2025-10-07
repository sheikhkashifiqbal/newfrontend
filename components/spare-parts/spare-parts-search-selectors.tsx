'use client'

import React, { useState } from 'react'
import Container from '@/components/Container'
import CustomInput from '@/components/app-custom/custom-input'
import { ServiceSelector } from '@/components/services/selectors/service-selector'
import { CitySelector } from '@/components/services/selectors/city-selector'
import { Button } from '@/components/ui/button'
import PlusIcon from '@/assets/icons/spare-parts/PlusIcon.svg'
import CustomBlueBtn from '@/components/app-custom/CustomBlueBtn'

interface SparePart {
  id: number
  name: string
  quantity: number
}

interface ISparePartsSearchSelectors {
  onSearchClick?: () => void
}

export default function SparePartsSearchSelectors({ onSearchClick }: ISparePartsSearchSelectors) {
  const [spareParts, setSpareParts] = useState<SparePart[]>([])

  const handleAddPart = () => {
    const newId = spareParts.length + 1
    setSpareParts(prev => [
      ...prev,
      {
        id: newId,
        name: `#${newId} Spare part`,
        quantity: 1,
      },
    ])
  }

  const handleQuantityChange = (id: number, type: 'increment' | 'decrement') => {
    setSpareParts(prev =>
      prev.map(part =>
        part.id === id
          ? {
              ...part,
              quantity: type === 'increment' ? part.quantity + 1 : Math.max(1, part.quantity - 1),
            }
          : part
      )
    )
  }

  const handleRemove = (id: number) => {
    setSpareParts(prev => prev.filter(part => part.id !== id))
  }

  return (
    <div className={'w-full bg-soft-blue pt-14 pb-24'}>
      <Container>
        <div className={'flex flex-col gap-y-2'}>
          <h1 className={'text-[2rem] leading-[3rem] text-charcoal font-semibold'}>
            Need Car Spare parts? <br />
            Find Top Suppliers Near You Now!
          </h1>

          <div className={'flex flex-col gap-3'}>
            {/* Top Selectors */}
            <div className={'grid grid-cols-1 450:grid-cols-2 900:grid-cols-4 gap-3'}>
              <CustomInput
                className={'pl-5 rounded-[8px] text-base placeholder:text-charcoal '}
                placeholder={'VIN number'}
                value={''}
              />
              <ServiceSelector />
              <ServiceSelector />
              <CitySelector />
            </div>

            {/* Spare Parts (only render if any) */}
            {spareParts.length > 0 &&
              spareParts.map((part, index) => (
                <div key={part.id} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    className="col-span-9 pl-5 py-3 rounded-[8px] border text-base"
                    type="text"
                    value={part.name}
                    onChange={e =>
                      setSpareParts(prev =>
                        prev.map(p =>
                          p.id === part.id ? { ...p, name: e.target.value } : p
                        )
                      )
                    }
                  />
                  <div className="col-span-2 flex items-center justify-center gap-10 border rounded-[8px] px-3 py-3 bg-white">
                    <button className='text-gray-300 hover:text-gray-700' onClick={() => handleQuantityChange(part.id, 'decrement')}>−</button>
                    <span>{part.quantity}</span>
                    <button className='text-gray-300 hover:text-gray-700' onClick={() => handleQuantityChange(part.id, 'increment')}>+</button>
                  </div>
                  <button
                    className="col-span-1 text-xl border border-white text-gray-700 py-2.5 rounded-[8px]"
                    onClick={() => handleRemove(part.id)}
                  >
                    ✕
                  </button>
                </div>
              ))}

            {/* Action Buttons */}
            <div className={'flex gap-3'}>
              <Button
                className={
                  'flex flex-[0.8] py-3 px-4 items-center justify-center gap-x-3 bg-white/40 border rounded-[8px] border-white text-slate-gray text-base font-medium'
                }
                onClick={handleAddPart}
              >
+                Add new spare part
              </Button>
              <CustomBlueBtn onClick={onSearchClick} className={'flex-[0.2]'} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
