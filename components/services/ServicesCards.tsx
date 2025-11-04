'use client'
import { memo, useCallback, useEffect, useState } from "react"
import * as React from "react"
import ServiceCardModal from "@/components/services/service-card-modal"
import ServicesCardsContainer from "@/components/services/services-cards-container"
import LoginPopupModal from "@/components/login/LoginPopupModal"

function ServicesCards() {
  const [selectedBranchId, setSelectedBranchId] = useState<number | null>(null)
  const [openLoginModal, setOpenLoginModal] = useState(false)

  // ✅ Listen globally for re-login event (JWT expired)
  useEffect(() => {
    const openLoginHandler = () => setOpenLoginModal(true)
    window.addEventListener("open-login-modal", openLoginHandler)
    return () => window.removeEventListener("open-login-modal", openLoginHandler)
  }, [])

  const cardReserveBtnClickHandler = useCallback((branchId: number) => {
    const auth = typeof window !== "undefined" ? localStorage.getItem("auth_response") : null
    if (!auth) {
      setOpenLoginModal(true)
      return
    }
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

      {/* Reservation Modal */}
      <ServiceCardModal selectedBranchId={selectedBranchId} closeModal={handleModalClose} />

      {/* 🔹 Login Popup Modal */}
      <LoginPopupModal isOpen={openLoginModal} setIsOpen={setOpenLoginModal} />
    </div>
  )
}
export default memo(ServicesCards)
