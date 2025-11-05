'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Container from '@/components/Container'
import CustomInput from '@/components/app-custom/custom-input'
import ServiceSelector from '@/components/services/selectors/spare-parts-selector'
import StateMultiSelector from "@/components/register/selectors/state-multi-selector"
import { CitySelector } from '@/components/services/selectors/city-selector'
import { Button } from '@/components/ui/button'
import CustomBlueBtn from '@/components/app-custom/CustomBlueBtn'

interface SparePart {
  id: number
  name: string
  quantity: number
}

interface ISparePartsSearchSelectors {
  onSearchClick?: () => void
}

type ValidationErrors = {
  vin?: string
  service?: string
  city?: string
  state?: string
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export default function SparePartsSearchSelectors({ onSearchClick }: ISparePartsSearchSelectors) {
  const [vin, setVin] = useState<string>('')
  const [serviceId, setServiceId] = useState<string>('')   
  const [states, setStates] = useState<string[]>([])        
  const [cityId, setCityId] = useState<string>('')          
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [cityMap, setCityMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cities`)
        if (!res.ok) throw new Error('Failed to fetch cities')
        const data: Array<{ id: number; city: string }> = await res.json()
        const map: Record<string, string> = {}
        data.forEach(c => (map[c.id.toString()] = c.city))
        setCityMap(map)
      } catch {
        setCityMap({})
      }
    }
    fetchCities()
  }, [])

  const [spareParts, setSpareParts] = useState<SparePart[]>([])

  const handleAddPart = () => {
    const newId = spareParts.length + 1
    setSpareParts(prev => [
      ...prev,
      { id: newId, name: ``, quantity: 1 },
    ])
  }

  const handleQuantityChange = (id: number, type: 'increment' | 'decrement') => {
    setSpareParts(prev =>
      prev.map(part =>
        part.id === id
          ? { ...part, quantity: type === 'increment' ? part.quantity + 1 : Math.max(1, part.quantity - 1) }
          : part
      )
    )
  }

  const handleRemove = (id: number) => {
    setSpareParts(prev => prev.filter(part => part.id !== id))
  }

  const getUserLocation = useCallback((): Promise<{ lat: number; lon: number }> => {
    return new Promise(resolve => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
          () => resolve({ lat: 25.276987, lon: 55.296249 })
        )
      } else {
        resolve({ lat: 25.276987, lon: 55.296249 })
      }
    })
  }, [])

  // ✅ Validation: includes state
  const validate = useCallback((): boolean => {
    const next: ValidationErrors = {}
    if (!vin.trim()) next.vin = 'VIN is required'
    if (!serviceId) next.service = 'Please select a service'
    if (!states || states.length === 0) next.state = 'Please select at least one state'
    if (!cityId) next.city = 'Please select a city'
    setErrors(next)
    return Object.keys(next).length === 0
  }, [vin, serviceId, states, cityId])

  const handleSearch = useCallback(async () => {
    if (!validate()) return
    setLoading(true) // ✅ Show busy spinner overlay

    const { lat, lon } = await getUserLocation()
    const cityName = cityMap[cityId] ?? cityId

    const payload = {
      vin: vin.trim(),
      spareparts_id: Number(serviceId),
      state: states && states.length ? states : [],
      city: cityName,
    }

    try {
      const res = await fetch(`http://localhost:8081/api/spare-parts/search-by-vin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      sessionStorage.setItem('sp_search_results', JSON.stringify(Array.isArray(json) ? json : []))
    } catch {
      sessionStorage.setItem('sp_search_results', JSON.stringify([]))
    } finally {
      sessionStorage.setItem('sp_search_payload', JSON.stringify(payload))
      sessionStorage.setItem('sp_user_location', JSON.stringify({ lat, lon }))
      setLoading(false) // ✅ Hide spinner after fetch completes
    }

    onSearchClick && onSearchClick()
  }, [validate, getUserLocation, vin, serviceId, states, cityId, cityMap, onSearchClick])

  return (
    <div className={'relative w-full bg-soft-blue pt-14 pb-24'}>
      {/* ✅ Busy Overlay Spinner */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-steel-blue border-t-transparent"></div>
            <span className="text-steel-blue font-medium">Searching spare parts...</span>
          </div>
        </div>
      )}

      <Container>
        <div className={'flex flex-col gap-y-2'}>
          <h1 className={'text-[2rem] leading-[3rem] text-charcoal font-semibold'}>
            Need Car Spare parts? <br />
            Find Top Suppliers Near You Now!
          </h1>

          <div className={'flex flex-col gap-3'}>
            <div className={'grid grid-cols-1 450:grid-cols-2 900:grid-cols-4 gap-3'}>
              {/* VIN */}
              <div className="flex flex-col gap-1">
                <CustomInput
                  className={'pl-5 rounded-[8px] text-base placeholder:text-charcoal '}
                  placeholder={'VIN number'}
                  value={vin}
                  onChange={setVin}
                />
                {errors.vin && <p className="text-red-500 text-sm">{errors.vin}</p>}
              </div>

              {/* Service */}
              <div className="flex flex-col gap-1">
                <ServiceSelector
                  value={serviceId}
                  onChange={setServiceId}
                />
                {errors.service && <p className="text-red-500 text-sm">{errors.service}</p>}
              </div>

              {/* State */}
              <div className="flex flex-col gap-1">
                <StateMultiSelector
                  value={states}
                  onChange={(vals?: string[]) => setStates(vals ?? [])}
                />
                {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
              </div>

              {/* City */}
              <div className="flex flex-col gap-1">
                <CitySelector
                  value={cityId}
                  onChange={(v?: string) => setCityId(v ?? '')}
                />
                {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
              </div>
            </div>

            {/* Spare Parts (unchanged) */}
            {spareParts.length > 0 &&
              spareParts.map((part) => (
                <div key={part.id} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    className="col-span-9 pl-5 py-3 rounded-[8px] border text-base"
                    type="text"
                    value={part.name}
                    onChange={e =>
                      setSpareParts(prev =>
                        prev.map(p => (p.id === part.id ? { ...p, name: e.target.value } : p))
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

            <div className={'flex gap-3'}>
              <Button
                className={
                  'flex flex-[0.8] py-3 px-4 items-center justify-center gap-x-3 bg-white/40 border rounded-[8px] border-white text-slate-gray text-base font-medium'
                }
                onClick={handleAddPart}
              >
                + Add new spare part
              </Button>

              {/* Search */}
              <CustomBlueBtn onClick={handleSearch} className={'flex-[0.2]'} />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
