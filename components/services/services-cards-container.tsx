'use client'
import { memo, useEffect, useRef, useState } from 'react'
import  ServiceCenterCard  from '@/components/services/service-center-card'
import * as React from 'react'

interface IServicesCardsContainer {
  cardReserveBtnClickHandler: (id: number) => void
}

export type BranchServiceItem = {
  branchName: string
  serviceNames: string[]
  branchCoverImg: string
  logoImg: string
  stars: number
  percentage_booking: number
}

const ServicesCardsContainer = ({ cardReserveBtnClickHandler }: IServicesCardsContainer) => {
  const [data, setData] = useState<BranchServiceItem[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const [lastRowIndex, setLastRowIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [servicesRes, statsRes] = await Promise.all([
          fetch(`${BASE_URL}/api/branches/services`),
          fetch(`${BASE_URL}/api/stats/branches/booking`)
        ])

        if (!servicesRes.ok || !statsRes.ok) throw new Error('API fetch failed')

        const branches = await servicesRes.json()
        const stats = await statsRes.json()

        // ✅ Merge stats (percentage_booking) with branches by index
        const merged = branches.map((b: any, index: number) => ({
          branchName: b.branchName,
          serviceNames: b.serviceNames,
          branchCoverImg: b.branchCoverImg,
          logoImg: b.logoImg,
          stars: b.stars ?? 0,
          percentage_booking: stats[index]?.percentage_booking ?? 0
        }))

        if (isMounted) setData(merged)
      } catch (e: any) {
        if (isMounted) setError(e?.message ?? 'Failed to load')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const calculateGridColumns = () => {
    if (gridRef.current) {
      const width = window.innerWidth
      let numColumns = 1
      if (width >= 2060) numColumns = 6
      else if (width >= 1650) numColumns = 5
      else if (width >= 1280) numColumns = 4
      else if (width >= 1000) numColumns = 3
      else if (width >= 570) numColumns = 2
      else numColumns = 1
      return numColumns
    }
    return 1
  }

  const updateLastRowIndex = () => {
    const cardsLength = data.length
    const numColumns = calculateGridColumns()
    const remainder = cardsLength % numColumns
    const idx = remainder === 0 ? cardsLength - numColumns : cardsLength - remainder
    setLastRowIndex(Math.max(0, idx))
  }

  useEffect(() => {
    updateLastRowIndex()
    window.addEventListener('resize', updateLastRowIndex)
    return () => window.removeEventListener('resize', updateLastRowIndex)
  }, [data])

  if (loading) return <div className="py-5">Loading branches…</div>
  if (error) return <div className="py-5 text-red-600">Error: {error}</div>

  return (
    <div
      ref={gridRef}
      className={
        'py-5 grid grid-cols-1 570:grid-cols-2 gap-x-5 mx-auto 1000:mx-0 1000:grid-cols-3 xl:grid-cols-4 1650:grid-cols-5 2060:grid-cols-6 1000:gap-x-3 gap-y-6'
      }
    >
      {data.map((item, index) => {
        const isLastRow = index >= lastRowIndex
        return (
          <ServiceCenterCard
            key={`${item.branchName}-${index}`}
            id={index}
            isLastRow={isLastRow}
            onClick={cardReserveBtnClickHandler}
            branchName={item.branchName}
            serviceNames={item.serviceNames}
            branchCoverImg={item.branchCoverImg}
            logoImg={item.logoImg}
            stars={item.stars}
            percentage_booking={item.percentage_booking}
          />
        )
      })}
    </div>
  )
}

export default memo(ServicesCardsContainer)
