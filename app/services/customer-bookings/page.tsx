"use client";

import React, { useEffect, useMemo, useState } from "react";
import BookingTable, {
  ReservationRow,
  ReservationSparePart,
} from "@/components/booking/my-booking-table";
import NavTabs from "@/components/nav-tabs";

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
    setSpEditingRows(
      (reservation.reservation_service_sparepart ?? []).map((s) => ({ ...s }))
    );
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
  if (!userId) return null;

  return (
    <div className="bg-gray-50 pb-20">
      <section className="max-w-[1120px] mx-auto px-4 py-8">
        <NavTabs tabItems={tabItems} />
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
        />
      )}

      {/* Spare Parts Modal */}
      {spModalOpen && currentReservation && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                Spare parts for reservation #{currentReservation.reservation_id}
              </h3>
              <button
                className="rounded-md w-9 h-9 inline-flex items-center justify-center hover:bg-gray-100"
                onClick={closeSpareParts}
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full table-auto">
                <thead className="bg-[#F8F9FA] text-xs text-[#ADB5BD] text-left">
                  <tr>
                    <th className="px-3 py-2 w-[160px]">Spare parts type</th>
                    <th className="px-3 py-2 w-[260px]">Part name</th>
                    <th className="px-3 py-2 w-[100px]">Qty</th>
                    <th className="px-3 py-2 w-[160px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-[#495057] divide-y">
                  {spEditingRows.map((row, idx) => (
                    <tr key={row.reservation_service_sparepart_id}>
                      <td className="px-3 py-2">{row.spareparts_type}</td>
                      <td className="px-3 py-2">
                        <input
                          className="w-full border rounded-md px-2 py-1"
                          value={row.part_name}
                          onChange={(e) =>
                            updateRowLocal(idx, { part_name: e.target.value })
                          }
                          placeholder="Part name"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          className="w-24 border rounded-md px-2 py-1"
                          type="number"
                          min={1}
                          step={1}
                          value={row.qty}
                          onChange={(e) =>
                            updateRowLocal(idx, { qty: Number(e.target.value) })
                          }
                        />
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1.5 text-xs rounded-md border bg-[#F8FBFF] text-[#3F72AF]"
                            onClick={() => handleUpdateSparePart(row, idx)}
                          >
                            Update
                          </button>
                          <button
                            className="px-3 py-1.5 text-xs rounded-md border text-red-600"
                            onClick={() => handleDeleteSparePart(row)}
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {spEditingRows.length === 0 && (
                    <tr>
                      <td
                        className="px-3 py-4 text-center text-gray-500"
                        colSpan={4}
                      >
                        No spare parts for this reservation.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <a
                href="/spare-parts"
                className="py-2 px-4 bg-[#F8FBFF] border rounded-lg text-[#3F72AF] font-semibold text-sm"
              >
                Search Spare parts
              </a>
              <button className="py-2 px-4 rounded-lg border" onClick={closeSpareParts}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBooking;

/** --------- Icons Nav --------- */
const tabItems = [
  {
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
