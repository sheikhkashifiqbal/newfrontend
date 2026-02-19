import React, { useMemo } from "react";

export type ReservationStatus = "pending" | "completed" | "cancelled";

export type ReservationSparePart = {
  reservation_service_sparepart_id: number;
  part_name: string;
  qty: number;
  spareparts_id: number;
  spareparts_type: string;
  reservation_id: number;
};

export type ReservationRow = {
  reservation_date: string; // "YYYY-MM-DD"
  reservation_time: string; // "HH:mm:ss"
  branch_name: string;
  address: string;
  city: string;
  logo_img: string; // eg: "logo-1.jpg"
  brand_name: string;
  model_name: string;
  service_name: string;
  reservation_status: ReservationStatus;
  reservation_id: number;
  branch_brand_serviceid: number;
  plate_number: string;
  stars?: number;
  reservation_service_sparepart?: ReservationSparePart[];
  // Optional fields (if backend returns them, they’ll be forwarded in cancel body)
  car_id?: number;
  service_id?: number;
  user_id?: number;
  price?: number;
  currency: string;
};

type BookingTableProps = {
  bookings: ReservationRow[];
  activeTab: "Pending" | "Completed" | "Cancelled";
  onOpenSpareParts: (reservation: ReservationRow) => void;
  onCancel: (reservation: ReservationRow) => void;
  onReschedule?: (reservation: ReservationRow) => void; // reserved
  onReviewClick?: (reservation: ReservationRow) => void;
  onCancelReviewClick?: (reservation: ReservationRow) => void;
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function formatDateUS(isoDate: string) {
  // -> "Sep 5, 2024"
  const d = new Date(isoDate + "T00:00:00");
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatTimeHHmm(hms: string) {
  // "10:30:00" -> "10:30"
  if (!hms) return "";
  if (hms.length >= 5) return hms.slice(0, 5);
  return hms;
}

const BookingTable: React.FC<BookingTableProps> = ({
  bookings = [],
  activeTab,
  onOpenSpareParts,
  onCancel,
  onReschedule,
  onReviewClick,
  onCancelReviewClick,
}) => {
  const isUpcoming = activeTab === "Pending";
  const isCompleted = activeTab === "Completed";
  const isCancelled = activeTab === "Cancelled";

  const tableHead = useMemo(() => {
    return (
      <thead className="bg-[#F8F9FA] text-xs text-[#ADB5BD] text-left">
        <tr>
          <th className="px-4 py-3 w-[240px]">Service &amp; Location</th>
          <th className="px-4 py-3 w-[150px]">Reservation time</th>
          <th className="px-4 py-3 w-[240px]">
            Selected car &amp; Number
          </th>
          <th className="px-4 py-3 w-[160px]">Service type</th>
          <th className="px-4 py-3 w-[160px]">Price</th>
          {isUpcoming && (
            <>
              <th className="px-4 py-3 w-[200px]">
                Spare parts asked by service
              </th>
              <th className="px-4 py-3 w-[120px] text-right">Actions</th>
            </>
          )}
          {isCompleted && <th className="px-4 py-3 w-[160px]">Review</th>}
          {isCancelled && <th className="px-4 py-3 w-[160px]">Cancel</th>}
        </tr>
      </thead>
    );
  }, [isUpcoming, isCompleted, isCancelled]);

  if (bookings.length === 0) {
    return (
      <div className="w-full max-w-[1120px] mx-auto px-4 pb-20">
        <div className="text-center py-10 text-gray-500">
          No bookings found.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 pb-20">
      <div className="rounded-2xl border border-[#E9ECEF] overflow-hidden">
        <table className="w-full table-auto divide-y divide-gray-200">
          {tableHead}
          <tbody className="text-sm text-[#495057] divide-y divide-gray-200">
            {bookings.map((b, idx) => {
              const logoUrl = `${BASE_URL}/images/${b.logo_img}`;
              return (
                <tr
                  key={`${b.reservation_id}-${idx}`}
                  className={idx % 2 === 1 ? "bg-[#F8F9FA]" : ""}
                >
                  {/* Service & Location */}
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-start gap-3">
                      <img
                        src={logoUrl}
                        alt="logo"
                        width={36}
                        height={36}
                        className="rounded-md object-cover shrink-0 border"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            "/request-img.png";
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium break-words">
                          {b.branch_name} KK
                        </span>
                        <span className="text-[#454545] text-xs mt-1 break-words">
                          {b.address}, {b.city}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Reservation time */}
                  <td className="px-4 py-4 whitespace-nowrap align-top">
                    {formatDateUS(b.reservation_date)}
                    <br />
                    {formatTimeHHmm(b.reservation_time)}
                  </td>

                  {/* Selected car & Number */}
                  <td className="px-4 py-4 whitespace-nowrap align-top">
                    {b.brand_name} {b.model_name}
                    <br />
                    {b.plate_number}
                  </td>

                  {/* Service type */}
                  <td className="px-4 py-4 align-top">{b.service_name}</td>
                  <td className="px-4 py-4 align-top">{b.price} {b.currency}</td>

                  {/* Upcoming-only: Spare parts column */}
                  {isUpcoming && (
                    <>
                      <td className="px-4 py-4 align-top">
                        <button
                          onClick={() => onOpenSpareParts(b)}
                          className="py-1.5 px-3 bg-[#F8FBFF] border rounded-lg text-[#3F72AF] font-semibold text-xs"
                          aria-label="View or search spare parts"
                        >
                          View / Search
                        </button>
                      </td>

                      {/* Actions menu */}
                      <td className="px-4 py-4 align-top">
                        <div className="relative flex justify-end">
                          <details className="group">
                            <summary className="list-none cursor-pointer inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-gray-100">
                              <svg
                                width="20"
                                height="20"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  d="M12 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Z"
                                  stroke="#495057"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M19 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1Z"
                                  stroke="#495057"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M5 13c.55 0 1-.45 1-1S5.55 11 5 11s-1 .45-1 1 .45 1 1 1Z"
                                  stroke="#495057"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </summary>
                            <div className="absolute right-0 mt-2 min-w-40 rounded-lg border bg-white shadow-lg z-10">
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onCancel(b);
                                }}
                              >
                                Cancel
                              </button>
                              {/*
                              <button
                                className="w-full text-left px-3 py-2 hover:bg-gray-50"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onReschedule?.(b);
                                }}
                              >
                                Reschedule
                              </button>
                              */}
                            </div>
                          </details>
                        </div>
                      </td>
                    </>
                  )}

                  {/* Completed: Review column */}
                  {isCompleted && (
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm">
                        {Number(b.stars ?? 0) > 0 ? (
                          <div>Review is sent</div>
                        ) : (
                          <>
                            <div>Not Review yet</div>
                            <button
                              onClick={() => onReviewClick?.(b)}
                              className="text-[#3F72AF] underline hover:text-[#3F72AF]/80 cursor-pointer"
                            >
                              Review it
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )
                 
                  }

                  {/* Cancelled: Cancel review column */}
                  {isCancelled && (
                    <td className="px-4 py-4 align-top">
                      <div className="text-sm">
                        <div className="text-gray-500 mb-1">
                          Write your cancel review
                        </div>
                        <button
                          onClick={() => onCancelReviewClick?.(b)}
                          className="text-[#3F72AF] underline hover:text-[#3F72AF]/80 cursor-pointer"
                        >
                          Review it
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingTable;
