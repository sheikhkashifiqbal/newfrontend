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

// Match backend casing used in your examples ("class A/B/C")
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const CLASS_OPTIONS = ["class A", "class B", "class C"] as const;
const API_URL = `${BASE_URL}/api/spare-parts/offers/by-user`;

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
        className={`fixed top-4 right-4 z-[60] px-4 py-3 rounded-lg shadow-lg text-sm ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
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
      const userId = Number(localStorage.getItem("user_id") || 1);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const list: any[] = await res.json();
      const row = list.find((d: any) => d.sparepartsrequest_id === requestId);
      if (row) {
        setModalCarPart(row.spareparts_type);
        const details: ApiSparePartItem[] = (row.spare_part || []).map((d: any) => ({
          id: d.id,
          sparepartsrequest_id: d.sparepartsrequest_id ?? row.sparepartsrequest_id,
          spare_part: d.spare_part,
          class_type: d.class_type,
          qty: d.qty,
          price: d.price,
        }));
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

  // ---- API helpers for detail rows (kept, not changed in behavior) ----
  const updateDetailAt = async (idx: number) => {
    const row = modalItems[idx];
    if (!row?.id) return;
    try {
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
      if (!res.ok) throw new Error(String(res.status));
      showToast("Row updated successfully", "success");
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to update detail:", e);
      showToast("Update failed", "error");
    }
  };

  // NOTE: this re-declaration existed in your file; left untouched as requested
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const createDetailAt = async (idx: number) => {
    const row = modalItems[idx];
    if (!modalRequestId) return; // safety: need request id
    if (!row?.spare_part) return; // basic guard to avoid empty creation
    try {
      const res = await fetch(`${BASE_URL}/api/spare-parts/request-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sparepartsrequest_id: modalRequestId,
          spare_part: row.spare_part,
          class_type: row.class_type,
          qty: Number(row.qty) || 0,
          price: Number(row.price) || 0,
        }),
      });
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
    next: "accepted_offer" | "pending" | "canceled"
  ) => {
    try {
      await fetch(`${BASE_URL}/api/spareparts-requests/${sparepartsrequest_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestStatus: next }),
      });
      console.log("Statusss", next);
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

  // 🔹 NEW: Save all rows with one Add/Update button (POST /request-details/${row.id})
  const saveAllRows = async () => {
    if (!modalItems.length) return;

    try {
      for (const row of modalItems) {
        // For each row, call POST /api/spare-parts/request-details/${row.id}
        // (as per your requirement – repeated for all rows)
        const idSegment = row.id != null ? `/${row.id}` : "";
        const url = `${BASE_URL}/api/spare-parts/request-details${idSegment}`;

        console.log("Id:::", idSegment);

        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sparepartsrequest_id: row.sparepartsrequest_id ?? modalRequestId,
            spare_part: row.spare_part,
            class_type: row.class_type,
            qty: Number(row.qty) || 0,
            price: Number(row.price) || 0,
          }),
        });
      }

      showToast("All rows saved successfully", "success");
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to save all rows:", e);
      showToast("Failed to save rows", "error");
    }
  };

  // Columns vary by tab. Pending & Accepted requests hide Action/Review
  const columns = useMemo(() => {
    return {
      showAction,
      showReview,
      sparePartsButtonLabel: activeTab === "Pending" ? "View/Edit" : "View",
      canEditSpareParts: activeTab === "Pending",
      showAcceptDecline: activeTab === "Accepted requests",
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

            <td className="px-0 py-4 flex justify-center">
              {columns.showAcceptDecline ? (
                <div className="flex gap-2 items-center">
                  <button
                    className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                    onClick={() =>
                      openModal(
                        r.spareParts,
                        r.carPart,
                        false,
                        r.sparepartsrequest_id
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    className="py-1.5 px-3 bg-[#E7F8ED] border rounded-[8px] text-green-700 font-semibold text-xs"
                    onClick={() =>
                      acceptOrDecline(r.sparepartsrequest_id, "accepted_offer")
                    }
                  >
                    Accept
                  </button>

                  <button
                    className="py-1.5 px-3 bg-[#FFF3CD] border rounded-[8px] text-[#8A6D3B] font-semibold text-xs"
                    onClick={() =>
                      acceptOrDecline(r.sparepartsrequest_id, "canceled")
                    }
                  >
                    Decline
                  </button>
                </div>
              ) : (
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
              )}
            </td>

            {columns.showAction && (
              <td className="px-4 py-4">{r.managerMobile}</td>
            )}

            {columns.showReview && (
              <td className="px-4 py-4">
                <div className="flex flex-col items-start gap-2">
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
          <div className="relative bg-gray-50 pb-3 rounded-xl shadow-xl max-h-[90vh] 
      overflow-hidden w-[96%] sm:w-[680px] md:w-[600px] px-3">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4">
              <div className="">
                <h3 className="text-base font-semibold text-[#212529]">Spare parts</h3>
              <p className="text-sm">For <span className="text-blue-400">New Engine Parts</span> of VIN <span className="text-blue-400">27393A7GDB67WOP921</span></p>
              </div>

              <button onClick={closeModal} className="text-[#6C757D] text-sm">
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

            {/* Scroll area */}
            <div className="overflow-y-auto max-h-[70vh] px-2">
              {/* horizontal scroll wrapper */}
              <div className="overflow-x-auto">

                {/* min-width forces mobile scroll instead of squeezing */}
                <table className="text-base min-w-[650px] md:min-w-full">
                  <thead className="sticky top-0 z-10">
                    <tr className="text-[#495057] text-xs md:text-sm">
                      <th className="text-left px-3 py-3 font-medium w-[20%]">
                        Parts Type
                      </th>
                      <th className="text-left px-3 py-3 font-medium w-[22%]">
                        Spare Part
                      </th>
                      <th className="text-left px-3 py-3 font-medium w-[20%]">
                        Class Type
                      </th>
                      <th className="text-left px-3 py-3 font-medium w-[12%]">
                        Qty
                      </th>
                      <th className="text-left px-3 py-3 font-medium w-[13%]">
                        Price
                      </th>
                      {editMode && (
                        <th className="text-right px-3 py-3 font-medium w-[10%]">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>

                  <tbody className="">
                    {demoModalItems?.length === 0 ? (
                      <tr>
                        <td
                          colSpan={editMode ? 7 : 6}
                          className="px-5 py-8 text-center text-[#6C757D]"
                        >
                          No items
                        </td>
                      </tr>
                    ) : (
                      demoModalItems?.map((it, idx) => (
                        <tr
                          key={`${it.id ?? it.spare_part}-${idx}`}
                          className="text-[#495057] align-middle"
                        >
                          {/* Sparepart Type */}
                          <td className="px-1 py-2">
                            <input
                              value={modalCarPart || ""}
                              className="text-black border p-2.5 rounded-lg w-full"
                              disabled
                            />
                          </td>

                          {/* Spare Part */}
                          <td className="px-1 py-2">
                            {editMode ? (
                              <input
                                className="text-black border p-2.5 rounded-lg w-full"
                                value={it.spare_part}
                                onChange={(e) =>
                                  setModalItems((prev) =>
                                    prev.map((x, i) =>
                                      i === idx ? { ...x, spare_part: e.target.value } : x
                                    )
                                  )
                                }
                              />
                            ) : (
                              <input
                                type="text"
                                min={0}
                                className="text-black border p-2.5 rounded-lg w-full"
                                value={String(it.spare_part ?? "")}
                                disabled
                              />
                            )}
                          </td>

                          {/* Class Type */}
                          <td className="px-1 py-2">
                            {editMode ? (
                              <div className="relative w-full">
                                {/* SELECT BOX */}
                                <select
                                  className="text-black border p-2.5 rounded-lg w-full appearance-none pr-10"
                                  value={it.class_type}
                                  onChange={(e) =>
                                    setModalItems((prev) =>
                                      prev.map((x, i) =>
                                        i === idx ? { ...x, class_type: e.target.value } : x
                                      )
                                    )
                                  }
                                >
                                  {CLASS_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                      {opt}
                                    </option>
                                  ))}
                                </select>

                                {/* CUSTOM ICON */}
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                  <svg
                                    width="18"
                                    height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#495057"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M6 9l6 6 6-6" />
                                  </svg>
                                </span>
                              </div>
                            ) : (
                              <input
                                type="text"
                                min={0}
                                className="text-black border p-2.5 rounded-lg w-full"
                                value={String(it.class_type ?? "")}
                                disabled
                              />
                            )}
                          </td>


                          {/* Qty */}
                          <td className="px-1 py-2">
                            {editMode ? (
                              <input
                                type="number"
                                min={0}
                                className="text-black border p-2.5 rounded-lg w-full"
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
                              />
                            ) : (
                              <input
                                type="number"
                                min={0}
                                className="text-black border p-2.5 rounded-lg w-full"
                                value={String(it.qty ?? "")}
                                disabled
                              />
                            )}
                          </td>

                          {/* Price */}
                          <td className="px-1 py-2">
                            {editMode ? (
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                className="text-black border p-2.5 rounded-lg w-full"
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
                              />
                            ) : (
                              <input
                                type="number"
                                min={0}
                                className="text-black border p-2.5 rounded-lg w-full"
                                value={String(it.price ?? "")}
                                disabled
                              />
                            )}
                          </td>

                          {/* Actions */}
                          {editMode && (
                            <td className="px-1 py-2 text-right">
                              <button
                                className="border p-2.5 rounded-lg text-red-600 font-bold w-12 hover:bg-red-600 hover:text-white"
                                onClick={() => deleteDetail(it)}
                              >
                                ×
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Add/Update */}
            {editMode && (
              <div className="px-3 pt-4 pb-1 flex justify-center">
                <button
                  className="py-4 px-6 w-full bg-[#3F72AF] hover:bg-blue-800 text-white rounded-lg"
                  onClick={saveAllRows}
                >
                  Add / Update
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


const demoModalItems: ApiSparePartItem[] = [
  {
    id: 101,
    sparepartsrequest_id: 1,
    spare_part: "Air Filter",
    class_type: "class A",
    qty: 1,
    price: 120,
  },
  {
    id: 102,
    sparepartsrequest_id: 1,
    spare_part: "Oil Filter",
    class_type: "class B",
    qty: 2,
    price: 45,
  },
  {
    id: 103,
    sparepartsrequest_id: 1,
    spare_part: "Spark Plug",
    class_type: "class C",
    qty: 4,
    price: 30,
  },
];
