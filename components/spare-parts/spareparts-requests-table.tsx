import React, { useMemo, useState, useEffect } from "react";
// ⚠️ Update the import path to where your page lives in your app
import type { SparePartRequestUI, ApiSparePartItem } from "@/app/spare-parts/customer-bookings/page"; // update the import path to where your page lives

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
  const showToast = (message: string, type: ToastType = "success") => setToast({ message, type });
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

const SparePartsTable: React.FC<SparePartsTableProps> = ({ services = [], activeTab = "Accepted offers", onStatusChange }) => {
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

  // ---- API helpers for detail rows
  const updateDetailAt = async (idx: number) => {
    const row = modalItems[idx];
    if (!row?.id) return;

    try {
      // --- FIRST REQUIRED API CALL ---
      const res = await fetch(`${BASE_URL}/api/spare-parts/request-details/${row.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sparepartsrequest_id: row.sparepartsrequest_id,
          spare_part: row.spare_part,
          class_type: row.class_type,
          qty: Number(row.qty) || 0,
          price: Number(row.price) || 0,
        }),
      });

      if (!res.ok) throw new Error(String(res.status));

      // --- SECOND API CALL (Automatically after first one succeeds) ---
      await fetch(`http://localhost:8081/api/spareparts-requests/${row.sparepartsrequest_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestStatus: "accepted_request" }),
      });

      // Show success notification
      showToast("Updated successfully!", "success");

      // Refresh popup UI
      if (modalRequestId) await refreshModalFromServer(modalRequestId);

      // Notify parent state updater if provided
      onStatusChange?.(row.sparepartsrequest_id!, "accepted_request");

    } catch (e) {
      console.error("Failed to update detail:", e);
      showToast("Update failed", "error");
    }
  };

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
      await fetch(`${BASE_URL}/api/spare-parts/request-details/${row.id}`, { method: "DELETE" });
      if (modalRequestId) await refreshModalFromServer(modalRequestId);
    } catch (e) {
      console.error("Failed to delete detail:", e);
    }
  };

  const acceptOrDecline = async (sparepartsrequest_id: number, next: "accepted_offer" | "pending") => {
    try {
      await fetch(`${BASE_URL}/api/spareparts-requests/${sparepartsrequest_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_status: next }),
      });
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
                <th className="px-4 py-3 w-[260px] break-words">Service & Location</th>
                <th className="px-4 py-3 w-[210px] break-words">VIN / Plate</th>
                <th className="px-4 py-3 w-[140px] break-words">Car part</th>
                <th className="px-4 py-3 w-[120px] break-words">State</th>
                <th className="px-4 py-3 w-[180px] break-words">Spare parts</th>
                {columns.showAction && <th className="px-4 py-3 w-[160px] break-words">Action</th>}
                {columns.showReview && <th className="px-4 py-3 w-[160px] break-words">Review</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 text-[#495057] text-base">
              {services.map((r) => (
                <tr key={`${r.id}-${r.vinOrPlate}`} className="hover:bg-gray-50">
                  <td className="px-4 py-4 break-words">{r.date}</td>
                  <td className="px-4 py-4 font-medium break-words">
                    <div className="flex items-start gap-3">
                      <img src="/request-img.png" width={24} className="mt-[2px]" alt="" />
                      <div>
                        <div className="text-[#212529]">{r.branchName}</div>
                        <div className="text-sm text-[#6C757D]">{r.address}</div>
                        <div className="text-sm text-[#6C757D]">{r.city}</div>
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
                      onClick={() => openModal(r.spareParts, r.carPart, columns.canEditSpareParts, r.sparepartsrequest_id)}
                    >
                      {columns.sparePartsButtonLabel}
                    </button>
                  </td>

                  {/* Visible only for Accepted offers */}
                  {columns.showAction && <td className="px-0 py-0 break-words">{r.managerMobile}AAA</td>}
                  {columns.showReview && (
                    <td className="px-4 py-4 break-words">
                      <div className="flex flex-col items-start justify-between gap-2">
                        <span className="text-gray-500 text-sm">Not reviewed yet.</span>
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
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className="bg-white w-[95%] sm:w-[850px] rounded-2xl shadow-xl p-6 space-y-6">

            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">Required spare part</h2>
                <p className="text-gray-500 text-sm mt-1">
                  For <span className="text-indigo-600 font-medium cursor-pointer hover:underline">New Engine Parts</span> of VIN{" "}
                  <span className="text-indigo-600 underline cursor-pointer">27393A7GDB67WOP921</span>
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 text-xl" onClick={closeModal}>✕</button>
            </div>

            <hr className="border-gray-200" />

            {/* Tabs */}
            <div className="flex gap-3">
              <button className="px-5 py-1.5 bg-blue-100 text-blue-600 font-medium rounded-lg">
                Engine
              </button>
            </div>

            {/* Table */}
            <div className={`grid ${editMode ? "grid-cols-8" : "grid-cols-7"} text-gray-500 font-medium text-sm px-2`}>
              <div className="col-span-2">Spareparts Type</div>
              <div className="col-span-2">Spare Part</div>
              <div className="text-center">Class Type</div>
              <div className="text-center">Qty</div>
              <div className="text-center">Price</div>
              {editMode && <div className="text-center">Actions</div>}
            </div>


            <div className="space-y-3">
              {modalItems?.map((item, idx) => (
                <div key={item.id} className={`grid gap-3 items-center ${editMode ? "grid-cols-8" : "grid-cols-7"}`}>
                  {/* Part Name */}
                  <input
                    value={modalCarPart}
                    readOnly
                    className="col-span-2 w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700"
                  />
                  <input
                    value={item.spare_part}
                    readOnly
                    className="col-span-2 w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700"
                  />
                  <input
                    value={item.class_type}
                    readOnly
                    className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700"
                  />

                  <input
                    type="number"
                    min={0}
                    className={`w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700 ${editMode ? "bg-white" : "bg-[#E9ECEF] text-[#495057]"
                      }`}
                    value={String(item.qty ?? "")}
                    readOnly={!editMode}
                    onChange={
                      editMode
                        ? (e) =>
                          setModalItems((prev) =>
                            prev.map((x, i) =>
                              i === idx ? { ...x, qty: Number(e.target.value) } : x
                            )
                          )
                        : undefined
                    }
                  />


                  {editMode ? (
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700"
                      value={String(item.price ?? "")}
                      onChange={(e) =>
                        setModalItems((prev) =>
                          prev.map((x, i) =>
                            i === idx ? { ...x, price: Number(e.target.value) } : x
                          )
                        )
                      }
                    />
                  ) : (
                    <input
                      value={item.price}
                      readOnly
                      className="w-full px-4 py-3 bg-gray-50 rounded-xl focus:outline-none border border-gray-200 text-gray-700"
                    />
                  )}



                  {editMode && (
                      <button
                        className="mr-2 py-4 px-3 border rounded-[8px] text-[#0D6EFD] text-xs font-semibold"
                        onClick={() =>
                          modalItems[idx]?.id ? updateDetailAt(idx) : createDetailAt(idx)
                        }
                        title="Update this row"
                      >
                        Accept
                      </button>
                  )}

                </div>
              ))}
            </div>

            {/* Button */}
            <button className="w-full bg-[#3F72AF] text-white text-lg py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-[#335c8c] transition">
              📞 +994 55 995 47 65
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SparePartsTable;






