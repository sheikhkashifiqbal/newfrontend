'use client'
import { memo, useCallback, useState } from "react"
import * as React from "react"
import ServiceCardModal from "@/components/services/service-card-modal"
import ServicesCardsContainer from "@/components/services/services-cards-container"

function ServicesCards() {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)

  const cardReserveBtnClickHandler = useCallback((branchId: number) => {
    setSelectedBranchId(branchId)
  }, [])

  const handleModalClose = useCallback(() => {
    setSelectedBranchId(null)
  }, [])

  return (
    <div className={'flex flex-col gap-y-8'}>
      <h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>
        Reliable Car Workshops You Can Trust!
      </h1>
      <p className={'text-base text-charcoal max-w-[80ch]'}>
        Discover seamless car maintenance with our trusted service providers…
      </p>

      <ServicesCardsContainer cardReserveBtnClickHandler={cardReserveBtnClickHandler} />
      <ServiceCardModal selectedBranchId={selectedBranchId} closeModal={handleModalClose} />
    </div>
  )
}
export default memo(ServicesCards)
