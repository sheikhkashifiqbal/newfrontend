// =============================================
// File: components/services/service-card-modal.tsx (Full Source)
// =============================================
"use client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { CarSelector } from "@/components/services/selectors/car-selector-res"
import { CarModelSelector } from "@/components/services/selectors/car-model-selector-res"
import { ServiceSelector } from "@/components/services/selectors/service-selector-res"
import { addDays, format, isToday } from "date-fns"
import { memo, useEffect, useState } from "react"
import { X } from "lucide-react"
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import ServiceLogo from '@/assets/icons/services/ServiceLogo.svg'
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import { SelectionProvider, useSelection } from "@/hooks/services/useSelection"

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081"

// ----------------------------- CAR & SERVICE SELECTORS -----------------------------
function ServiceCardModalCarSelectors({ branchId }: { branchId: number }) {
  const { setSelections } = useSelection()

  const [brandOptions, setBrandOptions] = useState<{ brand_id: number; brand_name: string }[]>([])
  const [serviceOptions, setServiceOptions] = useState<{ service_id: number; service_name: string }[]>([])
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [selectedModel, setSelectedModel] = useState<string>("")

  const triggerClassname = 'border-soft-gray text-misty-gray text-sm italic font-medium'

  // Fetch brands when modal opens
  useEffect(() => {
    if (!branchId) return
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/branch-catalog/brands`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch_id: branchId }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Failed to load brands')
        const data = await res.json()
        const brands: { brand_id: number; brand_name: string }[] = Array.isArray(data?.brands) ? data.brands : []
        setBrandOptions(brands)
      } catch {
        setBrandOptions([])
      }
    })()

    return () => controller.abort()
  }, [branchId])

  // Fetch services when a brand is selected
  useEffect(() => {
    if (!branchId || !selectedBrandId) return
    const controller = new AbortController()

    ;(async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/branch-catalog/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ branch_id: branchId, brand_id: selectedBrandId }),
          signal: controller.signal,
        })
        if (!res.ok) throw new Error('Failed to load services')
        const data = await res.json()
        const services: { service_id: number; service_name: string }[] = Array.isArray(data?.services) ? data.services : []
        setServiceOptions(services)
      } catch {
        setServiceOptions([])
      }
    })()

    return () => controller.abort()
  }, [branchId, selectedBrandId])

  return (
    <div className="w-full grid grid-cols-2 600:grid-cols-3 gap-6">
      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Car brand *</label>
        <CarSelector
          options={brandOptions}
          onChange={(value) => {
            const brandIdNum = Number(value)
            setSelectedBrandId(brandIdNum)
            setSelections((prev: any) => ({ ...prev, selectedCar: value }))
          }}
          placeholder="Select the car brand"
          triggerClassname={triggerClassname}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Brand model *</label>
        <CarModelSelector
          brandId={selectedBrandId}
          value={selectedModel}
          onChange={(value) => {
            setSelectedModel(value)
            setSelections((prev: any) => ({ ...prev, selectedModel: value }))
          }}
          placeholder="Select model"
          triggerClassname={triggerClassname}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Service *</label>
        <ServiceSelector
          options={serviceOptions}
          onChange={(value) => setSelections((prev: any) => ({ ...prev, selectedService: value }))}
          placeholder="Select the service"
          triggerClassname={triggerClassname}
        />
      </div>
    </div>
  )
}

// ----------------------------- DATE SELECTOR -----------------------------
function ServiceCardModalDateSelector() {
  const { selections, setSelections } = useSelection()
  const today = new Date()
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i)
    return {
      fullDate: format(d, 'dd MMM yyyy'),
      iso: format(d, 'yyyy-MM-dd'),
      chip: format(d, 'dd MMM')
    }
  })

  function setDay(display: string, iso: string) {
    setSelections((prev: any) => ({ ...prev, selectedDay: display, selectedDateISO: iso }))
  }

  useEffect(() => {
    setDay(next7Days[0].fullDate, next7Days[0].iso)
  }, [])

  return (
    <div className="flex flex-col gap-y-3">
      <h5 className="text-dark-gray text-sm font-medium">Reservation Date</h5>
      <div className="w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4">
        {next7Days.map((day) => (
          <div
            key={day.iso}
            onClick={() => setDay(day.fullDate, day.iso)}
            className={cn(
              'flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray',
              day.fullDate === selections.selectedDay && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold'
            )}
          >
            {day.chip}
          </div>
        ))}
      </div>
    </div>
  )
}

// ----------------------------- TIME SELECTOR (includes available-slots API) -----------------------------
function ServiceCardModalTimeSelector({ branchId }: { branchId: number }) {
  const { selections, setSelections } = useSelection()
  const [times, setTimes] = useState<string[]>([])

  const fetchSlots = async (payload: { branch_id: number; date: string; brand_id?: number; model_id?: number; service_id?: number; }) => {
    const res = await fetch(`${BASE_URL}/api/reservations/available-slots`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: "include"
    })
    if (!res.ok) throw new Error('Failed to load time slots')
    const data = await res.json()
    const slots: string[] = Array.isArray(data?.availableTimeSlots) ? data.availableTimeSlots : []

    const selectedISO = (selections as any).selectedDateISO as string
    let visible = slots
    if (selectedISO) {
      const selectedDate = new Date(selectedISO + 'T00:00:00')
      if (isToday(selectedDate)) {
        const now = new Date()
        const nowMinutes = now.getHours() * 60 + now.getMinutes()
        visible = slots.filter((t) => {
          const [hh, mm] = t.split(':').map(Number)
          const mins = hh * 60 + (mm || 0)
          return mins > nowMinutes
        })
      }
    }

    setTimes(visible)
    if (visible.length > 0) {
      setSelections((prev: any) => ({ ...prev, selectedTime: visible[0] }))
    } else {
      setSelections((prev: any) => ({ ...prev, selectedTime: '' }))
    }
  }

  useEffect(() => {
    const selectedISO = (selections as any).selectedDateISO as string
    if (!branchId || !selectedISO) return
    fetchSlots({ branch_id: branchId, date: selectedISO }).catch(() => setTimes([]))
  }, [(selections as any).selectedDateISO, branchId])

  const handleSearchSlots = async () => {
    const brandId = Number((selections as any).selectedCar || '')
    const modelId = Number((selections as any).selectedModel || '')
    const serviceId = Number((selections as any).selectedService || '')
    const dateISO = (selections as any).selectedDateISO as string

    if (!brandId || !modelId || !serviceId) {
      alert('Please select car brand, model and service before searching time slots.')
      return
    }
    if (!dateISO) {
      alert('Please select a reservation date.')
      return
    }

    try {
      await fetchSlots({
        branch_id: branchId,
        brand_id: brandId,
        model_id: modelId,
        service_id: serviceId,
        date: dateISO
      })
    } catch {
      setTimes([])
    }
  }

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-dark-gray text-sm font-medium">Reservation time</h5>
        <button
          type="button"
          onClick={handleSearchSlots}
          className="text-xs px-3 py-1 rounded-md bg-steel-blue text-white"
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2">
        {times.map((time) => (
          <div
            key={time}
            onClick={() => setSelections((prev: any) => ({ ...prev, selectedTime: time }))}
            className={cn(
              'flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray',
              time === (selections as any).selectedTime && 'text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold'
            )}
          >
            {time}
          </div>
        ))}
        {times.length === 0 && (
          <div className="text-sm text-slate-gray">No available time slots.</div>
        )}
      </div>
    </div>
  )
}

// ----------------------------- MAIN STEPS -----------------------------
function ServiceCardModalStepOne({ branchId }: { branchId: number }) {
  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      <ServiceCardModalCarSelectors branchId={branchId} />
      <ServiceCardModalDateSelector />
      <ServiceCardModalTimeSelector branchId={branchId} />
    </div>
  )
}

function ServiceCardModalStepTwo({ reservationId }: { reservationId?: string }) {
  const { selections } = useSelection()
  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      {reservationId && (
        <div className="flex items-center gap-1">
          <h5 className="text-charcoal/50 text-xl">Reservation ID:</h5>
          <span className="text-charcoal text-xl font-medium">{reservationId}</span>
        </div>
      )}
      <div className="flex gap-4 items-center">
        <img className="size-14" src={ServiceLogo.src} />
        <div className="flex flex-col gap-y-0.5">
          <h4 className="text-xl text-charcoal font-semibold">Performance Center</h4>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Date & Time:</h5>
          <span className="font-medium text-base text-charcoal">
            {(selections as any).selectedDay}, {(selections as any).selectedTime}
          </span>
        </div>
        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Car and Model:</h5>
          <span className="font-medium text-base text-charcoal">
            Car Brand, Car Model
          </span>
        </div>
        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Service type:</h5>
          <span className="font-medium text-base text-charcoal">
            Service Type
          </span>
        </div>
        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Service location:</h5>
          <span className="font-medium text-base text-charcoal">Baku</span>
        </div>
      </div>
    </div>
  )
}


interface IServiceCardModal {
  selectedBranchId: number | null
  closeModal: () => void
}
function ServiceCardModal({ selectedBranchId, closeModal }: IServiceCardModal) {
  const [step, setStep] = useState(1)

  return (
    <Dialog open={selectedBranchId !== null}>
      <DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
        <DialogHeader className="w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0">
          <DialogTitle className="p-0 m-0 text-2xl text-charcoal font-medium">
            {step === 1 ? "Make the reservation" : step === 2 ? "Confirm your reservation" : step === 3 && "Your reservation been made"}
          </DialogTitle>
          <DialogPrimitive.Close onClick={() => {
            closeModal()
            setTimeout(() => setStep(1), 300)
          }}>
            <X className="size-6 text-charcoal/50" />
          </DialogPrimitive.Close>
        </DialogHeader>

        <SelectionProvider>
          {step === 1 && selectedBranchId !== null && (
            <ServiceCardModalStepOne branchId={selectedBranchId} />
          )}
          {step === 2 && <ServiceCardModalStepTwo />}
          {step === 3 && <ServiceCardModalStepTwo reservationId={'#1234567890'} />}
        </SelectionProvider>

        {step < 3 && (
          <DialogFooter className="px-8">
            <Button
              onClick={() => setStep((s) => s + 1)}
              className="bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full"
              type="button"
            >
              {step === 1 ? 'Make reservation' : 'Confirm'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default memo(ServiceCardModal)
