import React, { useMemo, useState, useEffect } from "react";
// ⚠️ Update the import path to where your page lives in your app
import type {
  SparePartRequestUI,
  ApiSparePartItem,
} from "@/app/spare-parts/customer-bookings/page"; // update the import path to where your page lives

interface SparePartsTableProps {
  services?: SparePartRequestUI[];
  activeTab?: String;
  onStatusChange?: (sparepartsrequest_id: number, nextStatus: string) => void;
}

// Match backend casing used in your examples ("A-class/B-class/C-class")
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CLASS_OPTIONS = ["A-class", "B-class", "C-class"] as const;
const API_URL = `${BASE_URL}/api/spare-parts/offers/store-branch`;

/* -------------------- Tiny Toast (no dependency) -------------------- */
type ToastType = "success" | "error";
const useToast = () => {
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (message: string, type: ToastType = "success") =>
    setToast({ message, type });

  const Toast = () =>
    toast ? (
      <div
        className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm ${
          toast.type === "success"
            ? "bg-green-600 text-white"
            : "bg-red-600 text-white"
        }`}
        role="status"
        aria-live="polite"
      >
        {toast.message}
      </div>
    ) : null;

  return { showToast, Toast };
};
/* ------------------------------------------------------------------- */

const SparePartsTable: React.FC<SparePartsTableProps> = ({
  services = [],
  activeTab = "Accepted offers",
  onStatusChange,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalItems, setModalItems] = useState<ApiSparePartItem[]>([]);
  const [modalCarPart, setModalCarPart] = useState<string>("");
  const [modalRequestId, setModalRequestId] = useState<number | null>(null);
  const [modalVin, setModalVin] = useState<string>("");
  const [modalManagerMobile, setModalManagerMobile] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false); // view for Accepted offers; view/edit for Pending
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRow, setReviewRow] = useState<SparePartRequestUI | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [reviewComment, setReviewComment] = useState<string>("");

  const { showToast, Toast } = useToast();

  const showAction = activeTab === "Accepted offers"; // show manager_mobile column only here
  const showReview = activeTab === "Accepted offers"; // show Review column only here

  // --- Refresh modal data from server whenever popup opens ---
  const refreshModalFromServer = async (requestId: number) => {
    try {
      //const userId = Number(localStorage.getItem("user_id") || 1);
      const authRaw = localStorage.getItem("auth_response");
      const parsed = authRaw ? JSON.parse(authRaw) : null;
      const id = parsed?.branch_id;

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_id: id }),
      });
      const list: any[] = await res.json();
      const row = list.find((d: any) => d.sparepartsrequest_id === requestId);
      if (row) {
        setModalCarPart(row.spareparts_type);
        setModalVin(row.viN || "");
        setModalManagerMobile(row.manager_mobile || "");
        const details: ApiSparePartItem[] = (row.spare_part || []).map(
          (d: any) => ({
            id: d.id,
            sparepartsrequest_id:
              d.sparepartsrequest_id ?? row.sparepartsrequest_id,
            spare_part: d.spare_part,
            class_type: d.class_type,
            qty: d.qty,
            price: d.price,
          })
        );
        setModalItems(details);
      }
    } catch (e) {
      console.error("Failed to refresh modal items:", e);
    }
  };

  const openModal = (
    items: ApiSparePartItem[],
    carPart: string,
    canEdit: boolean,
    requestId?: number,
    vin?: string,
    managerMobile?: string
  ) => {
    setModalOpen(true);
    setEditMode(canEdit);
    setModalRequestId(requestId ?? null);
    // immediate visual refresh from props
    setModalCarPart(carPart || "");
    setModalItems([...(items || [])]);
    setModalVin(vin || "");
    setModalManagerMobile(managerMobile || "");
    // and fetch latest from server to ensure fresh
    if (requestId) refreshModalFromServer(requestId);
  };

  const closeModal = () => setModalOpen(false);

  const onReview = (id: number) => {
    const row = services.find((r) => r.id === id);
    if (row) {
      setReviewRow(row);
      setReviewModalOpen(true);
      setRating(0);
      setReviewComment("");
    }
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setReviewRow(null);
    setRating(0);
    setReviewComment("");
  };

  const submitReview = async () => {
    if (!reviewRow || rating === 0) {
      showToast("Please provide a rating", "error");
      return;
    }

    try {
      // TODO: Replace with actual API endpoint
      // await fetch(`${BASE_URL}/api/spare-parts/reviews`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     sparepartsrequest_id: reviewRow.sparepartsrequest_id,
      //     rating: rating,
      //     comment: reviewComment,
      //   }),
      // });

      showToast("Review submitted successfully!", "success");
      closeReviewModal();
    } catch (e) {
      console.error("Failed to submit review:", e);
      showToast("Failed to submit review", "error");
    }
  };

  // ---- API helper: update a single detail row (used by "Accept All")
  const updateDetailAt = async (row: ApiSparePartItem) => {
    if (!row?.id) return;

    try {
      // --- FIRST REQUIRED API CALL ---
      const res = await fetch(
        `${BASE_URL}/api/spare-parts/request-details/${row.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sparepartsrequest_id: row.sparepartsrequest_id,
            spare_part: row.spare_part,
            class_type: row.class_type,
            qty: Number(row.qty) || 0,
            price: Number(row.price) || 0,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(String(res.status));
      }
    } catch (e) {
      console.error("Failed to update detail:", e);
      throw e;
    }
  };

  // NOTE: still kept for completeness, but not used in "Accept all" (Option A)
  const createDetailAt = async (idx: number) => {
    const row = modalItems[idx];
    if (!modalRequestId) return; // safety: need request id
    if (!row?.spare_part) return; // basic guard to avoid empty creation
    try {
      const res = await fetch(
        `${BASE_URL}/api/spare-parts/request-details`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sparepartsrequest_id: modalRequestId,
            spare_part: row.spare_part,
            class_type: row.class_type,
            qty: Number(row.qty) || 0,
            price: Number(row.price) || 0,
          }),
        }
      );
      if (!res.ok) throw new Error(String(res.status));
      await res.json().catch(() => null);
      showToast("Row added successfully", "success");
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to create detail:", e);
      showToast("Add failed", "error");
    }
  };

  const deleteDetail = async (row: ApiSparePartItem) => {
    // If it's a new row without an ID, just remove it from local state
    if (!row.id) {
      setModalItems((prev) => prev.filter((x) => x !== row));
      return;
    }
    
    try {
      await fetch(
        `${BASE_URL}/api/spare-parts/request-details/${row.id}`,
        { method: "DELETE" }
      );
      // Update local state immediately for better UX
      setModalItems((prev) => prev.filter((x) => x.id !== row.id));
      // Refresh from server to ensure consistency
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to delete detail:", e);
      showToast("Failed to delete item", "error");
    }
  };

  const acceptOrDecline = async (
    sparepartsrequest_id: number,
    next: "accepted_offer" | "pending"
  ) => {
    try {
      await fetch(
        `${BASE_URL}/api/spareparts-requests/${sparepartsrequest_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ request_status: next }),
        }
      );
      onStatusChange?.(sparepartsrequest_id, next);
    } catch (e) {
      console.error("Failed to update request status:", e);
    }
  };

  const addNewRow = () => {
    if (!editMode) return;
    setModalItems((prev) => [
      ...prev,
      {
        spare_part: "",
        class_type: CLASS_OPTIONS[0],
        qty: 1,
        price: 0,
        sparepartsrequest_id: modalRequestId ?? 0,
      } as ApiSparePartItem,
    ]);
  };

  // 🔹 NEW: single "Accept" button to update ALL rows with id in one click (Option A)
  const handleAcceptAll = async () => {
    if (!editMode || modalItems.length === 0) return;

    // Determine the request id for the second API call
    const requestId =
      modalRequestId ??
      modalItems[0]?.sparepartsrequest_id ??
      null;

    if (!requestId) {
      showToast("Missing request id", "error");
      return;
    }

    try {
      // 1) Update all rows that have an id
      for (const row of modalItems) {
        if (!row.id) continue; // Option A: update only existing rows
        await updateDetailAt(row);
      }

      // 2) AFTER all detail rows are updated, call existing request API
      // ⚠️ As per your requirement, DO NOT change this URL or body key.
      await fetch(
        `http://localhost:8081/api/spareparts-requests/${requestId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestStatus: "accepted_request" }),
        }
      );

      // 3) Show success toast
      showToast("All rows accepted successfully!", "success");

      // 4) Refresh popup data
      if (modalRequestId) {
        await refreshModalFromServer(modalRequestId);
      }

      // 5) Notify parent (tab counts / status)
      onStatusChange?.(requestId, "accepted_request");
    } catch (e) {
      console.error("Failed to accept all details:", e);
      showToast("Failed to accept all rows", "error");
    }
  };

  // Columns vary by tab.
  const columns = useMemo(() => {
    return {
      showAction,
      showReview,
      sparePartsButtonLabel: activeTab === "Pending" ? "View/Edit" : "View",
      canEditSpareParts: activeTab === "Pending",
      // 🔹 Sent offers tab: no more Accept/Decline; always use View / View/Edit button
      showAcceptDecline: false,
    };
  }, [activeTab, showAction, showReview]);

  return (
    <div className="w-full max-w-[1120px] mx-auto px-4 pb-20">
      <Toast />
      {services.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No services found.</div>
      ) : (
        <div className="rounded-3xl border border-[#E9ECEF] overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="min-w-max w-full table-auto divide-y divide-gray-200">
              <thead className="bg-[#F8F9FA] text-left text-xs text-[#ADB5BD]">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Service & Location</th>
                  <th className="px-4 py-3">VIN / Plate</th>
                  <th className="px-4 py-3">Car part</th>
                  <th className="px-4 py-3">State</th>
                  <th className="px-4 py-3">Spare parts</th>

                  {columns.showAction && <th className="px-4 py-3">Action</th>}
                  {columns.showReview && <th className="px-4 py-3">Review</th>}
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200 text-[#495057] text-base">
                {services.map((r) => (
                  <tr key={`${r.id}-${r.vinOrPlate}`} className="hover:bg-gray-50">
                    <td className="px-4 py-4">{r.date}</td>

                    <td className="px-4 py-4 font-medium">
                      <div className="flex items-start gap-3">
                        <img
                          src="/request-img.png"
                          width={24}
                          className="mt-[2px]"
                          alt=""
                        />
                        <div>
                          <div className="text-[#212529]">{r.branchName}</div>
                          <div className="text-sm text-[#6C757D]">{r.address}</div>
                          <div className="text-sm text-[#6C757D]">{r.city}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">{r.vinOrPlate}</td>
                    <td className="px-4 py-4">{r.carPart}</td>
                    <td className="px-4 py-4">{r.state}</td>

                    <td className="px-0 py-4">
                      <div className="flex justify-center items-center">
                        <button
                          className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                          onClick={() =>
                            openModal(
                              r.spareParts,
                              r.carPart,
                              columns.canEditSpareParts,
                              r.sparepartsrequest_id,
                              r.vinOrPlate,
                              r.managerMobile
                            )
                          }
                        >
                          {columns.sparePartsButtonLabel}
                        </button>
                      </div>
                    </td>

                    {columns.showAction && (
                      <td className="px-4 py-4">{r.managerMobile}</td>
                    )}

                    {columns.showReview && (
                      <td className="px-4 py-4">
                        <div className="flex flex-col items-start">
                          <span className="text-gray-500 text-sm">
                            Not reviewed yet.
                          </span>
                          <button
                            className="text-[#3F72AF] text-sm font-semibold"
                            onClick={() => onReview(r.id)}
                          >
                            Review it
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Spare parts vertical modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* modal wrapper optimized for 800px */}
          <div className="relative bg-light-gray rounded-3xl shadow-xl max-h-[90vh] 
      overflow-hidden w-[95%] md:max-w-[650px] lg:max-w-[800px]">

            {/* Header */}
            <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-blue-gray">
              <div className="flex-1">
                <h3 className="text-2xl font-medium text-charcoal mb-2">
                  {editMode ? "Required spare parts" : "Required spare part"}
                </h3>
                <p className="text-sm text-gray-600">
                  For <span className="text-[#3F72AF]">{modalCarPart || "New Engine Parts"}</span> of VIN <span className="text-[#3F72AF]">{modalVin || "27393A7GDB67WOP921"}</span>
                </p>
              </div>

              <button onClick={closeModal} className="text-charcoal/50 ml-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Scroll area */}
            <div className="overflow-y-auto max-h-[60vh] px-8 py-4">
              {/* Category button */}
              <div className="mb-4">
                <button className="text-dark-gray text-sm font-medium rounded-[8px] bg-ice-mist border border-soft-sky py-2 px-4 max-w-fit">
                  {modalCarPart || "Engine"}
                </button>
              </div>

              {editMode ? (
                /* Edit Mode Layout (Pending tab) - Part name, Qty, Price, Delete */
                <>
                  {/* Table headers */}
                  <div className="grid grid-cols-12 text-[14px] text-gray-600 font-semibold mb-2 px-1">
                    <span className="col-span-5">Part name</span>
                    <span className="col-span-2 pl-3">Qty.</span>
                    <span className="col-span-3 pl-3">Price</span>
                    <span className="col-span-2 text-center">Delete</span>
                  </div>

                  {/* Table rows */}
                  {modalItems?.length === 0 ? (
                    <div className="text-center py-8 text-[#6C757D]">
                      No items
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {modalItems?.map((it, idx) => (
                        <div key={`${it.id ?? it.spare_part}-${idx}`} className="grid grid-cols-12 gap-3">
                          {/* Part name */}
                          <div className="col-span-5">
                            <input
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
                              value={it.spare_part}
                              onChange={(e) =>
                                setModalItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx ? { ...x, spare_part: e.target.value } : x
                                  )
                                )
                              }
                              placeholder="Enter part name"
                            />
                          </div>

                          {/* Qty */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              min={0}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
                              value={String(it.qty ?? "")}
                              onChange={(e) =>
                                setModalItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, qty: Number(e.target.value) }
                                      : x
                                  )
                                )
                              }
                              placeholder="Ex: 100"
                            />
                          </div>

                          {/* Price */}
                          <div className="col-span-3">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
                              value={String(it.price ?? "")}
                              onChange={(e) =>
                                setModalItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? { ...x, price: Number(e.target.value) }
                                      : x
                                  )
                                )
                              }
                              placeholder="0"
                            />
                          </div>

                          {/* Delete */}
                          <div className="col-span-2 flex items-center justify-center">
                            <button
                              onClick={() => deleteDetail(it)}
                              className="w-full h-full flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-100 transition text-gray-600"
                            >
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 6L6 18M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add spare part button */}
                  <button
                    onClick={addNewRow}
                    className="mt-3 flex items-center gap-2 bg-[#E9ECEF] px-5 py-3 rounded-lg text-gray-700 font-medium text-[12px] hover:bg-gray-100 max-w-fit"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    Add spare part
                  </button>
                </>
              ) : (
                /* View Mode Layout (Accepted offers/requests) - Part name, Class, Qty, Price */
                <>
                  {/* Table headers */}
                  <div className="grid grid-cols-12 text-[14px] text-gray-600 font-semibold mb-2 px-1">
                    <span className="col-span-4">Part name</span>
                    <span className="col-span-3 pl-3">Class</span>
                    <span className="col-span-2 pl-3">Qty</span>
                    <span className="col-span-3 pl-3">Price</span>
                  </div>

                  {/* Table rows */}
                  {modalItems?.length === 0 ? (
                    <div className="text-center py-8 text-[#6C757D]">
                      No items
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {modalItems?.map((it, idx) => (
                        <div key={`${it.id ?? it.spare_part}-${idx}`} className="grid grid-cols-12 gap-3">
                          {/* Part name */}
                          <div className="col-span-4">
                            <input
                              type="text"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
                              value={String(it.spare_part ?? "")}
                              disabled
                            />
                          </div>

                          {/* Class */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
                              value={String(it.class_type ?? "")}
                              disabled
                            />
                          </div>

                          {/* Qty */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              min={0}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
                              value={String(it.qty ?? "")}
                              disabled
                            />
                          </div>

                          {/* Price */}
                          <div className="col-span-3">
                            <input
                              type="number"
                              min={0}
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
                              value={String(it.price ?? "")}
                              disabled
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {editMode ? (
              /* Edit Mode Footer - Accept button (for branch bookings) */
              modalItems.length > 0 ? (
                <div className="px-8 pb-8 pt-4">
                  <button
                    onClick={handleAcceptAll}
                    className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] text-white text-[16px] font-semibold py-4 rounded-xl shadow"
                  >
                    Accept
                  </button>
                </div>
              ) : null
            ) : (
              /* View Mode Footer - Phone Button */
              <div className="px-8 pb-8 pt-4">
                <a
                  href={`tel:${modalManagerMobile || "+994559954765"}`}
                  className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] text-white text-[16px] font-semibold py-4 rounded-xl shadow flex items-center justify-center gap-2"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  {modalManagerMobile || "+994 55 995 47 65"}
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && reviewRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeReviewModal} />

          {/* modal wrapper */}
          <div className="relative bg-gray-50 pb-3 rounded-xl shadow-xl max-h-[90vh] 
      overflow-hidden w-[96%] sm:w-[680px] md:w-[600px] px-3">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b">
              <h3 className="text-base font-semibold text-[#212529]">
                How would you rate your experience?
              </h3>
              <button onClick={closeReviewModal} className="text-[#6C757D] text-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="#212529"
                    strokeOpacity="0.5"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh] px-4 py-4">
              {/* Service & Location Info */}
              <div className="flex items-center justify-between gap-5 mb-6">
                <div className="flex flex-col gap-2">
                  <p className="text-[#6C757D] font-medium text-xs">Service & Location</p>
                  <h4 className="text-[#212529] text-base font-medium">{reviewRow.branchName}</h4>
                  <p className="text-sm text-[#6C757D]">{reviewRow.address}, {reviewRow.city}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-[#6C757D] font-medium text-xs">Car Part & VIN</p>
                  <h4 className="text-[#212529] text-base font-medium">{reviewRow.carPart}</h4>
                  <p className="text-sm text-[#6C757D]">{reviewRow.vinOrPlate}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="mb-6">
                <p className="text-[#212529] font-medium text-sm mb-3">Rating</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill={star <= rating ? "#FFD700" : "none"}
                        stroke={star <= rating ? "#FFD700" : "#D1D5DB"}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="cursor-pointer hover:scale-110 transition-transform"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label className="block text-[#212529] font-medium text-sm mb-2">
                  Your Review (Optional)
                </label>
                <textarea
                  className="w-full border p-3 rounded-lg text-black resize-none"
                  rows={4}
                  placeholder="Share your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 pt-4 pb-4 border-t flex gap-3">
              <button
                className="flex-1 py-3 px-6 border border-gray-300 rounded-lg text-[#495057] font-semibold hover:bg-gray-100"
                onClick={closeReviewModal}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 px-6 bg-[#3F72AF] hover:bg-blue-800 text-white rounded-lg font-semibold"
                onClick={submitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsTable;
