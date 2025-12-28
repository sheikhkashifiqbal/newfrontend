"use client";

import React, { useEffect, useMemo, useState } from "react";
import BookingTable, {
  ReservationRow,
  ReservationSparePart,
} from "@/components/booking/my-booking-table";
import NavTabs from "@/components/nav-tabs";
import UserReviewExperiencePopup from "@/components/dashboard/user/my-bookings/completed-tab/user-review-experience-popup";
import { UserBookingCompleted } from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab-columns";
import UserCancelReservationPopup from "@/components/dashboard/user/my-bookings/upcoming-tab/user-cancel-reservation-popup";
import { UserBookingUpcoming } from "@/components/dashboard/user/my-bookings/upcoming-tab/user-bookings-upcoming-tab-columns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { FiPlus } from "react-icons/fi";
import { cn } from "@/lib/utils";

/** ----- Tabs / Page Layout State ----- */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const statuses = ["Pending", "Completed", "Cancelled"] as const;
type TabStatus = typeof statuses[number];

const MyBooking: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabStatus>("Pending");
  const [data, setData] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  /** Spare parts modal state */
  const [spModalOpen, setSpModalOpen] = useState(false);
  const [spEditingRows, setSpEditingRows] = useState<ReservationSparePart[]>([]);
  const [currentReservation, setCurrentReservation] = useState<ReservationRow | null>(null);

  /** Review modal state */
  const [reviewedRow, setReviewedRow] = useState<UserBookingCompleted | null>(null);

  /** Cancel review modal state */
  const [cancelReviewRow, setCancelReviewRow] = useState<UserBookingUpcoming | null>(null);

  // ✅ NEW: User ID access control
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const authRaw = localStorage.getItem("auth_response");
      if (!authRaw) {
        window.location.href = "/"; // redirect if no auth
        return;
      }
      const parsed = JSON.parse(authRaw);
      const id = parsed?.id;
      if (id) {
        localStorage.setItem("userId", String(id));
        setUserId(String(id));
      } else {
        window.location.href = "/"; // redirect if no id
      }
    } catch {
      window.location.href = "/"; // redirect if error
    }
  }, []);

  /** Fetch reservations by user (POST) */
  useEffect(() => {
    if (!userId) return; // wait for userId
    const fetchData = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(`${BASE_URL}/api/reservations/by-user`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: ReservationRow[] = await res.json();

        // Normalize status to union type
        const normalized = json.map((r) => ({
          ...r,
          reservation_status:
            (r.reservation_status as any)?.toLowerCase?.() ?? r.reservation_status,
        })) as ReservationRow[];

        setData(normalized);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load bookings.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  /** Counts for tabs */
  const tabCounts = useMemo(() => {
    const counts: Record<TabStatus, number> = { Pending: 0, Completed: 0, Cancelled: 0 };
    for (const r of data) {
      const s = r.reservation_status;
      if (s === "pending") counts.Pending++;
      else if (s === "completed") counts.Completed++;
      else if (s === "cancelled") counts.Cancelled++;
    }
    return counts;
  }, [data]);

  /** Filter for active tab */
  const filtered = useMemo(() => {
    const key = activeTab.toLowerCase();
    return data.filter(
      (d) => d.reservation_status === (key as ReservationRow["reservation_status"])
    );
  }, [data, activeTab]);

  /** -------- Spare Parts Modal Handlers -------- */
  const openSpareParts = (reservation: ReservationRow) => {
    setCurrentReservation(reservation);
    const existingParts = reservation.reservation_service_sparepart ?? [];
    if (existingParts.length > 0) {
      setSpEditingRows(existingParts.map((s) => ({ ...s })));
    } else {
      // Initialize with one empty row
      setSpEditingRows([
        {
          reservation_service_sparepart_id: Date.now(),
          part_name: "",
          qty: 1,
          spareparts_id: 0,
          spareparts_type: "Engine",
          reservation_id: reservation.reservation_id,
        },
      ]);
    }
    setSpModalOpen(true);
  };

  const closeSpareParts = () => {
    setSpModalOpen(false);
    setCurrentReservation(null);
    setSpEditingRows([]);
  };

  const updateRowLocal = (idx: number, patch: Partial<ReservationSparePart>) => {
    setSpEditingRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const validateRow = (row: ReservationSparePart) => {
    const nameOk = String(row.part_name ?? "").trim().length > 0;
    const qtyNum = Number(row.qty);
    const qtyOk = Number.isFinite(qtyNum) && qtyNum > 0 && Number.isInteger(qtyNum);
    return nameOk && qtyOk;
  };

  const handleUpdateSparePart = async (row: ReservationSparePart, idx: number) => {
    if (!validateRow(row)) {
      alert("Part name and a positive integer quantity are required.");
      return;
    }
    try {
      const res = await fetch(
        `${BASE_URL}/api/reservation-service-spareparts/${row.reservation_service_sparepart_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partName: row.part_name,
            qty: row.qty,
            reservationId: row.spareparts_id,
            sparepartsId: row.reservation_id,
          }),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      alert("Updated.");
    } catch (e: any) {
      alert(e?.message ?? "Update failed.");
    }
  };

  const handleDeleteSparePart = async (row: ReservationSparePart) => {
    if (!confirm("Delete this spare part?")) return;
    try {
      const res = await fetch(
        `${BASE_URL}/api/reservation-service-spareparts/${row.reservation_service_sparepart_id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSpEditingRows((prev) =>
        prev.filter(
          (x) => x.reservation_service_sparepart_id !== row.reservation_service_sparepart_id
        )
      );
      alert("Deleted.");
    } catch (e: any) {
      alert(e?.message ?? "Delete failed.");
    }
  };

  const handleAddSparePart = () => {
    setSpEditingRows((prev) => [
      ...prev,
      {
        reservation_service_sparepart_id: Date.now(),
        part_name: "",
        qty: 1,
        spareparts_id: 0,
        spareparts_type: currentReservation?.reservation_service_sparepart?.[0]?.spareparts_type || "Engine",
        reservation_id: currentReservation?.reservation_id || 0,
      },
    ]);
  };

  /** -------- Cancel Action -------- */
  const handleCancel = async (reservation: ReservationRow) => {
    if (
      !confirm(
        `Cancel reservation #${reservation.reservation_id} for ${reservation.brand_name} ${reservation.model_name}?`
      )
    ) {
      return;
    }
    console.log('reservation::', reservation);
    const reqBody: any = {
      userId: reservation.user_id ?? userId,
      carId: reservation.car_id,
      serviceId: reservation.service_id,
      reservationDate: reservation.reservation_date,
      reservationTime: reservation.reservation_time?.slice(0, 5) ?? "",
      reservationStatus: "canceled",
    };
    
    Object.keys(reqBody).forEach((k) => reqBody[k] === undefined && delete reqBody[k]);

    try {
      const res = await fetch(
        `${BASE_URL}/api/reservations/${reservation.reservation_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
          credentials: "include",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      setData((prev) =>
        prev.map((r) =>
          r.reservation_id === reservation.reservation_id
            ? { ...r, reservation_status: "cancelled" }
            : r
        )
      );
      alert("Reservation canceled.");
    } catch (e: any) {
      alert(e?.message ?? "Cancel failed.");
    }
  };

  // 🚫 Prevent rendering until userId verified
  // if (!userId) return null;

  const handleTopTabsChange = (label: string) => {
    if (label === "Profile info") {
      window.location.href = "/profile/user";
      return;
    }
    if (label === "Spare part request") {
      window.location.href = "/spare-parts/customer-bookings";
      return;
    }
    if (label === "My bookings") {
      window.location.href = "/services/customer-bookings";
      return;
    }
  };

  /** -------- Review Modal Handlers -------- */
  const handleOpenReview = (reservation: ReservationRow) => {
    // Map ReservationRow to UserBookingCompleted format
    const reviewData: UserBookingCompleted = {
      id: reservation.reservation_id,
      service: `${reservation.branch_name}, ${reservation.address}, ${reservation.city}`,
      time: `${formatDateUS(reservation.reservation_date)}, ${formatTimeHHmm(reservation.reservation_time)}`,
      car: `${reservation.brand_name} ${reservation.model_name}, ${reservation.plate_number}`,
      serviceType: reservation.service_name,
      addedBy: "By Service", // Default value, adjust if you have this data
      review: reservation.stars ?? null,
    };
    setReviewedRow(reviewData);
  };

  const handleCloseReview = () => {
    setReviewedRow(null);
  };

  /** -------- Cancel Review Modal Handlers -------- */
  const handleOpenCancelReview = (reservation: ReservationRow) => {
    // Map ReservationRow to UserBookingUpcoming format
    const cancelReviewData: UserBookingUpcoming = {
      id: reservation.reservation_id,
      service: `${reservation.branch_name}, ${reservation.address}, ${reservation.city}`,
      time: `${formatDateUS(reservation.reservation_date)}, ${formatTimeHHmm(reservation.reservation_time)}`,
      car: `${reservation.brand_name} ${reservation.model_name}, ${reservation.plate_number}`,
      serviceType: reservation.service_name,
      askedSpareParts: reservation.reservation_service_sparepart ?? [],
    };
    setCancelReviewRow(cancelReviewData);
  };

  const handleCloseCancelReview = () => {
    setCancelReviewRow(null);
  };

  // Helper functions for date/time formatting (matching BookingTable)
  function formatDateUS(isoDate: string) {
    const d = new Date(isoDate + "T00:00:00");
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d);
  }

  function formatTimeHHmm(hms: string) {
    if (!hms) return "";
    if (hms.length >= 5) return hms.slice(0, 5);
    return hms;
  }

  return (
    <div className="bg-gray-50 pb-20">
      <section className="max-w-[1120px] mx-auto px-4 py-8">
        <NavTabs tabItems={tabItems} defaultActiveTab="My bookings" id={1} onChange={handleTopTabsChange}/>
      </section>

      <section className="max-w-[1120px] mx-auto px-4 mb-8">
        <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">My Bookings</h2>
        <p className="text-[#ADB5BD] text-xl md:text-[20px] mt-2">
          See your scheduled services from your calendar.
        </p>
      </section>

      {/* Tabs */}
      <section className="border-b border-gray-200 mb-8">
        <div className="flex gap-6 max-w-[1120px] mx-auto px-4 overflow-x-auto">
          {statuses.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                className={`px-0 py-4 font-medium flex items-center gap-2 border-b-2 ${
                  isActive
                    ? "text-[#3F72AF] border-[#3F72AF]"
                    : "text-[#ADB5BD] border-transparent hover:text-[#3F72AF]"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <img
                  src={
                    tab === "Pending"
                      ? "/icons/clock-fast-forward.svg"
                      : tab === "Completed"
                      ? "/icons/check-circle-broken.svg"
                      : "/icons/delete.svg"
                  }
                  width={20}
                  height={20}
                  alt=""
                />
                <span>{tab == "Pending" ? "UpComing": tab} </span>
                <span className="px-2 py-[2px] text-xs border border-[#E9ECEF] rounded-2xl">
                  {tabCounts[tab] ?? 0}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Table */}
      {loading && <div className="max-w-[1120px] mx-auto px-4">Loading bookings…</div>}
      {err && <div className="max-w-[1120px] mx-auto px-4 text-red-600">{err}</div>}
      {!loading && !err && (
        <BookingTable
          bookings={filtered}
          activeTab={activeTab}
          onOpenSpareParts={openSpareParts}
          onCancel={handleCancel}
          onReschedule={(r) =>
            alert(`Reschedule flow for #${r.reservation_id} (to be implemented).`)
          }
          onReviewClick={handleOpenReview}
          onCancelReviewClick={handleOpenCancelReview}
        />
      )}

      {/* Spare Parts Modal */}
      <Dialog open={spModalOpen} onOpenChange={setSpModalOpen}>
        <DialogContent className={cn("overflow-y-auto max-w-[95%] md:max-w-[650px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-4")}>
          <DialogHeader className={"w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0 pb-6"}>
            <div className={"flex justify-between items-center"}>
              <DialogTitle className={"p-0 m-0 text-2xl text-charcoal font-medium"}>
                Required spare part
              </DialogTitle>
              <DialogPrimitive.Close onClick={closeSpareParts}>
                <X className={"size-6 text-charcoal/50"} />
              </DialogPrimitive.Close>
            </div>
          </DialogHeader>

          <div className={"flex flex-col gap-y-2 px-8"}>
            {/* Category button */}
            {currentReservation && (
              <div className={"text-dark-gray text-sm mb-2 font-medium rounded-[8px] bg-ice-mist border border-soft-sky py-2 px-4 max-w-fit"}>
                {spEditingRows[0]?.spareparts_type || "Engine"}
              </div>
            )}

            {/* Table headers */}
            <div className="grid grid-cols-12 text-[14px] text-gray-600 font-semibold mb-2 px-1">
              <span className="col-span-7">Part name</span>
              <span className="col-span-3">Qty.</span>
              <span className="col-span-2 text-center">Delete</span>
            </div>

            {/* Table rows */}
            {spEditingRows.map((row, idx) => (
              <div key={row.reservation_service_sparepart_id} className="grid grid-cols-12 gap-3">
                <div className="col-span-7">
                  <input
                    value={row.part_name}
                    onChange={(e) =>
                      updateRowLocal(idx, { part_name: e.target.value })
                    }
                    placeholder="Enter part name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
                  />
                </div>

                <div className="col-span-3">
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={row.qty}
                    onChange={(e) =>
                      updateRowLocal(idx, { qty: Number(e.target.value) })
                    }
                    placeholder="Ex: 100"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
                  />
                </div>

                <button
                  onClick={() => handleDeleteSparePart(row)}
                  className="col-span-2 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-100 transition"
                >
                  <X className="text-gray-600 size-5" />
                </button>
              </div>
            ))}

            {/* Add spare part button */}
            <button
              onClick={handleAddSparePart}
              className="mt-3 flex items-center gap-2 bg-[#E9ECEF] px-5 py-3 rounded-lg text-gray-700 font-medium text-[12px] hover:bg-gray-100 max-w-fit"
            >
              <FiPlus size={16} />
              Add spare part
            </button>

            {/* Search Spare Parts button */}
            <a
              href="/spare-parts"
              className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] text-white text-[16px] font-semibold py-4 rounded-xl shadow mt-4 text-center"
            >
              Search Spare Parts
            </a>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      <UserReviewExperiencePopup
        reviewedRow={reviewedRow}
        closePopup={handleCloseReview}
      />

      {/* Cancel Review Modal */}
      <UserCancelReservationPopup
        cancelledRow={cancelReviewRow}
        closePopup={handleCloseCancelReview}
      />
    </div>
  );
};

export default MyBooking;

/** --------- Icons Nav --------- */
const tabItems = [
  {
    id: 1,
    label: "My bookings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: 2,
    label: "Spare part request",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 7H17V17H7V7Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 3L21 21" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 3,
    label: "Profile info",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];
