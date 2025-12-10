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

// Match backend casing used in your examples ("class A/B/C") dashboard/service
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CLASS_OPTIONS = ["class A", "class B", "class C"] as const;
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
  const [editMode, setEditMode] = useState<boolean>(false); // view for Accepted offers; view/edit for Pending

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
    requestId?: number
  ) => {
    setModalOpen(true);
    setEditMode(canEdit);
    setModalRequestId(requestId ?? null);
    // immediate visual refresh from props
    setModalCarPart(carPart || "");
    setModalItems([...(items || [])]);
    // and fetch latest from server to ensure fresh
    if (requestId) refreshModalFromServer(requestId);
  };

  const closeModal = () => setModalOpen(false);

  const onReview = (id: number) => {
    alert(`Review: ${id}`);
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
    if (!row.id) return;
    try {
      await fetch(
        `${BASE_URL}/api/spare-parts/request-details/${row.id}`,
        { method: "DELETE" }
      );
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to delete detail:", e);
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
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA] text-left text-xs text-[#ADB5BD]">
              <tr>
                <th className="px-4 py-3 w-[110px] break-words">Date</th>
                <th className="px-4 py-3 w-[260px] break-words">
                  Service & Location
                </th>
                <th className="px-4 py-3 w-[210px] break-words">
                  VIN / Plate
                </th>
                <th className="px-4 py-3 w-[140px] break-words">Car part</th>
                <th className="px-4 py-3 w-[120px] break-words">State</th>
                <th className="px-4 py-3 w-[180px] break-words">
                  Spare parts
                </th>
                {columns.showAction && (
                  <th className="px-4 py-3 w-[160px] break-words">Action</th>
                )}
                {columns.showReview && (
                  <th className="px-4 py-3 w-[160px] break-words">Review</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-[#495057] text-base">
              {services.map((r) => (
                <tr
                  key={`${r.id}-${r.vinOrPlate}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4 break-words">{r.date}</td>
                  <td className="px-4 py-4 font-medium break-words">
                    <div className="flex items-start gap-3">
                      <img
                        src="/request-img.png"
                        width={24}
                        className="mt-[2px]"
                        alt=""
                      />
                      <div>
                        <div className="text-[#212529]">{r.branchName}</div>
                        <div className="text-sm text-[#6C757D]">
                          {r.address}
                        </div>
                        <div className="text-sm text-[#6C757D]">
                          {r.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 break-words">{r.vinOrPlate}</td>
                  <td className="px-4 py-4 break-words">{r.carPart}</td>
                  <td className="px-4 py-4 break-words">{r.state}</td>

                  {/* Spare parts column */}
                  <td className="px-0 py-4">
                    <button
                      className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                      onClick={() =>
                        openModal(
                          r.spareParts,
                          r.carPart,
                          columns.canEditSpareParts,
                          r.sparepartsrequest_id
                        )
                      }
                    >
                      {columns.sparePartsButtonLabel}
                    </button>
                  </td>

                  {/* Visible only for Accepted offers */}
                  {columns.showAction && (
                    <td className="px-0 py-0 break-words">
                      {r.managerMobile}AAA
                    </td>
                  )}
                  {columns.showReview && (
                    <td className="px-4 py-4 break-words">
                      <div className="flex flex-col items-start justify-between gap-2">
                        <span className="text-gray-500 text-sm">
                          Not reviewed yet.
                        </span>
                        <button
                          className="text-[#3F72AF] block text-sm font-semibold"
                          id={`review-btn-${r.id}`}
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
      )}

      {/* Spare parts vertical modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={closeModal} />

          {/* panel: bigger width, taller height (still vertical) */}
          <div className="relative bg-white rounded-xl shadow-xl max-h-[90vh] overflow-hidden w-[96%] sm:w-[680px] md:w-[740px]">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="text-base font-semibold text-[#212529]">
                Spare parts
              </h3>
              <div className="flex items-center gap-3">
                {/* + Add item removed as per requirement */}
                <button
                  onClick={closeModal}
                  className="text-[#6C757D] text-sm"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[80vh]">
              <table className="min-w-full text-base">
                <thead className="bg-[#F8F9FA] sticky top-0">
                  <tr className="text-[#ADB5BD] text-sm">
                    <th className="text-left px-5 py-3 w-[56px]">No.</th>
                    <th className="text-left px-5 py-3 w-[180px]">
                      Spareparts Type
                    </th>
                    <th className="text-left px-5 py-3 w-[220px]">
                      Spare Part
                    </th>
                    <th className="text-left px-5 py-3 w-[160px]">
                      Class Type
                    </th>
                    <th className="text-left px-5 py-3 w-[120px]">Qty</th>
                    <th className="text-left px-5 py-3 w-[140px]">Price</th>
                    {editMode && (
                      <th className="text-right px-3 py-3 w-[140px]">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {modalItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={editMode ? 7 : 6}
                        className="px-5 py-8 text-center text-[#6C757D]"
                      >
                        No items
                      </td>
                    </tr>
                  ) : (
                    modalItems.map((it, idx) => (
                      <tr
                        key={`${it.id ?? it.spare_part}-${idx}`}
                        className="text-[#495057] align-middle"
                      >
                        <td className="px-5 py-3">{idx + 1}</td>
                        <td className="px-5 py-3 break-words">
                          {modalCarPart}
                        </td>

                        {/* Spare Part - always read-only text field */}
                        <td className="px-0 py-0 break-words">
                          <input
                            className="w-full border rounded px-2 py-1 bg-[#E9ECEF] text-[#495057]"
                            value={it.spare_part}
                            readOnly
                          />
                        </td>

                        {/* Class Type - always read-only text field */}
                        <td className="px-0 py-0">
                          <input
                            className="w-full border rounded px-2 py-1 bg-[#E9ECEF] text-[#495057]"
                            value={it.class_type}
                            readOnly
                          />
                        </td>

                        {/* Qty - editable in Pending (editMode true), read-only otherwise */}
                        <td className="px-0 py-0">
                          <input
                            type="number"
                            min={0}
                            className={`w-full border rounded px-2 py-1 ${
                              editMode
                                ? "bg-white"
                                : "bg-[#E9ECEF] text-[#495057]"
                            }`}
                            value={String(it.qty ?? "")}
                            readOnly={!editMode}
                            onChange={
                              editMode
                                ? (e) =>
                                    setModalItems((prev) =>
                                      prev.map((x, i) =>
                                        i === idx
                                          ? {
                                              ...x,
                                              qty: Number(e.target.value),
                                            }
                                          : x
                                      )
                                    )
                                : undefined
                            }
                          />
                        </td>

                        {/* Price - keep same behavior as old code */}
                        <td className="px-0 py-0">
                          {editMode ? (
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              className="w-full border rounded px-2 py-1"
                              value={String(it.price ?? "")}
                              onChange={(e) =>
                                setModalItems((prev) =>
                                  prev.map((x, i) =>
                                    i === idx
                                      ? {
                                          ...x,
                                          price: Number(e.target.value),
                                        }
                                      : x
                                  )
                                )
                              }
                            />
                          ) : (
                            it.price
                          )}
                        </td>

                        {/* Actions column now intentionally empty in rows (Accept moved to bottom) */}
                        {editMode && (
                          <td className="px-3 py-3 text-right whitespace-nowrap">
                            {/* Accept button moved to the end of table as per requirement */}
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 🔹 NEW: Single centered Accept button at the end of table */}
            {editMode && modalItems.length > 0 && (
              <div className="px-5 py-4 border-t flex justify-center">
                <button
                  className="py-2 px-6 bg-[#F8FBFF] border rounded-[8px] text-[#0D6EFD] text-sm font-semibold"
                  onClick={handleAcceptAll}
                >
                  Accept
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsTable;
