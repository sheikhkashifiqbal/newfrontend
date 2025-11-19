'use client'
import { addDays, format } from "date-fns";
import { memo, useMemo, useState } from "react";
import * as React from "react";
import { cn } from "@/lib/utils";
import DistanceSelector from "@/components/services/services-search-results/distance-selector";
import SortbySelector from "@/components/services/services-search-results/sortby-selector";
import { useRouter } from "next/navigation";
import ServiceCardModal from "@/components/services/service-card-modal";
import LoginPopupModal from "@/components/login/LoginPopupModal";

type ResultItem = {
  branchId: number;
  branchName: string;
  location: string;
  companyRating: number | null;
  distanceKm: number | null;
  companyLogoUrl: string | null;
  availableTimeSlots: string[] | null;
  price: number | null;
};

type Props = {
  results: ResultItem[];
  /** yyyy-MM-dd */
  selectedDateISO: string;
  onChangeDate: (isoDate: string) => void;
  onChangeSort: (
    sortBy:
      | "DISTANCE_CLOSEST"
      | "DISTANCE_FARTHEST"
      | "RATING_HIGH_TO_LOW"
  ) => void;
};

function SearchResultCard({ item }: { item: ResultItem }) {
  const slots = item.availableTimeSlots ?? [];
  const rating = item.companyRating ?? 0;
  const router = useRouter();
  const distanceText =
    typeof item.distanceKm === "number"
      ? `${item.distanceKm.toFixed(1)} km away`
      : "—";
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // 🔹 Reservation modal + login modal controller
  const [openLoginModal, setOpenLoginModal] = useState(false);
  const [openReservationModal, setOpenReservationModal] = useState(false);

  // 🔹 Same logic as existing "Make a reservation" button
  const handleMakeReservationClick = () => {
    const auth = typeof window !== "undefined"
      ? localStorage.getItem("auth_response")
      : null;

    if (!auth) {
      setOpenLoginModal(true);
      return;
    }

    setOpenReservationModal(true);
  };

  return (
    <div className={"w-full bg-white p-6 rounded-3xl flex flex-col sm:flex-row gap-6"}>
      {/*Service Basic info*/}
      <div className={"basis-[35%] py-4 px-6 flex gap-4"}>

        {/* 🔥 CLICKABLE companyLogoUrl */}
        <img
          src={
            item.companyLogoUrl
              ? `${BASE_URL}/images/${item.companyLogoUrl}`
              : `/assets/icons/services/ServiceLogo.svg`
          }
          className={"rounded-full size-14 cursor-pointer"}
          alt="company logo"
          onClick={() => router.push(`/services/profile?branchId=${item.branchId}`)}
        />

        <div className={"flex flex-col gap-0.5"}>
          {/* 🔥 CLICKABLE Branch Name */}
          <h5
            onClick={() => router.push(`/services/profile?branchId=${item.branchId}`)}
            className={"text-charcoal text-base font-semibold cursor-pointer"}
          >
            {item.branchName}
          </h5>

          <div className={"flex items-center gap-1"}>
            <img src={`/assets/icons/services/YellowStarIcon.svg`} width={17} alt="rating" />
            <h6 className={"text-charcoal text-sm font-semibold"}>{rating}</h6>
          </div>

          <p className={"text-charcoal/50 text-sm"}>{distanceText}</p>
        </div>
      </div>

      {/*Available reservation times*/}
      <div className={"basis-[65%] flex flex-col gap-3"}>
        <h5 className={"text-dark-gray text-sm font-medium"}>Available reservation time</h5>
        <div className={"flex gap-1 flex-wrap"}>
          {slots.length === 0 && (
            <div className="text-sm text-slate-gray">No time slots available</div>
          )}
          {slots.map((time) => (
            <div
              key={time}
              className={
                "flex max-w-[96px] justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray"
              }
            >
              {time}
            </div>
          ))}
        </div>

        {/* 🔵 NEW BUTTON: Full login + reservation modal logic applied */}
       <button
         onClick={handleMakeReservationClick}
         style={{ width: "40%", margin: "0 auto" }}
         className={ "bg-steel-blue text-white text-base font-semibold rounded-[12px] py-3 px-6"}>
           Make a reservation
      </button>

      </div>

      {/* 🔥 Inject reservation modal */}
      <ServiceCardModal
        selectedBranchId={openReservationModal ? item.branchId : null}
        closeModal={() => setOpenReservationModal(false)}
      />

      {/* 🔥 Login Popup */}
      <LoginPopupModal isOpen={openLoginModal} setIsOpen={setOpenLoginModal} />
    </div>
  );
}

function ServicesSearchResults({
  results,
  selectedDateISO,
  onChangeDate,
  onChangeSort,
}: Props) {
  const today = useMemo(() => new Date(), []);
  const next7 = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(today, i)),
    [today]
  );
  const selectedLabel = useMemo(
    () => format(new Date(selectedDateISO), "dd MMM"),
    [selectedDateISO]
  );

  return (
    <div className={"flex flex-col gap-y-5"}>
      <h5 className={"text-dark-gray text-sm font-medium"}>Search results</h5>

      {/*Filters*/}
      <div className={"w-full flex flex-col 1100:flex-row gap-y-5 1100:items-center justify-between"}>
        <div className={"flex basis-[65%] flex-col gap-y-3"}>
          <h5 className={"text-dark-gray text-sm font-medium"}>Reservation Date</h5>
          <div className={"w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4"}>
            {next7.map((d) => {
              const label = format(d, "dd MMM");
              const iso = format(d, "yyyy-MM-dd");
              const active = label === selectedLabel;
              return (
                <div
                  onClick={() => onChangeDate(iso)}
                  key={iso}
                  className={cn(
                    "flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray",
                    active &&
                      "text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold"
                  )}
                >
                  {label}
                </div>
              );
            })}
          </div>
        </div>

        <div className={"grid basis-[25%] grid-cols-2 gap-5"}>
          <div className={"flex flex-col gap-y-3"}>
            <label className={"text-sm font-medium text-dark-gray"}>Distance</label>
            <DistanceSelector
              onChange={(v) =>
                onChangeSort(
                  (v as
                    | "DISTANCE_CLOSEST"
                    | "DISTANCE_FARTHEST") ?? "DISTANCE_CLOSEST"
                )
              }
            />
          </div>
          <div className={"flex flex-col gap-y-3"}>
            <label className={"text-sm font-medium text-dark-gray"}>Sort by</label>
            <SortbySelector
              onChange={(v) =>
                onChangeSort((v as "RATING_HIGH_TO_LOW") ?? "RATING_HIGH_TO_LOW")
              }
            />
          </div>
        </div>
      </div>

      {/*Search result cards*/}
      <div className={"w-full flex flex-col gap-y-2"}>
        {results.map((item) => (
          <SearchResultCard key={item.branchId} item={item} />
        ))}
        {results.length === 0 && (
          <div className="text-sm text-slate-gray">No results to show.</div>
        )}
      </div>
    </div>
  );
}

export default memo(ServicesSearchResults);
