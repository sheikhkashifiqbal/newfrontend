import React, { useMemo, useState, useEffect } from "react";
// ⚠️ Update the import path to where your page lives in your app
import type { SparePartRequestUI, ApiSparePartItem } from "@/app/spare-parts/request/page"; // update the import path to where your page lives
import ModalBox from "../model-box";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { FiChevronDown, FiPhone } from "react-icons/fi";


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
  const [modelType, setModelType] = useState("")

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

  const openModal = (type: any) => {
    setModalOpen(true);
    setModelType(type)
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
          <table className="w-full table-fixed divide-y divide-gray-200">
            <thead className="bg-[#F8F9FA] text-left text-xs text-[#ADB5BD]">
              <tr>
                <th className="px-4 py-3 w-[110px] break-words">Date</th>
                <th className="px-4 py-3 w-[260px] break-words">
                  Service & Location
                </th>
                <th className="px-4 py-3 w-[210px] break-words">VIN / Plate</th>
                <th className="px-4 py-3 w-[140px] break-words">Car part</th>
                <th className="px-4 py-3 w-[120px] break-words">State</th>
                <th className="px-4 py-3 w-[180px] break-words">Spare parts</th>
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
                        <div className="text-sm text-[#6C757D]">{r.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 break-words">{r.vinOrPlate}</td>
                  <td className="px-4 py-4 break-words">{r.carPart}</td>
                  <td className="px-4 py-4 break-words">{r.state}</td>

                  {/* Spare parts column */}
                  <td className="px-0 py-4">

                    {/* CASE #1 👉 Accepted Requests (Show Accept / Decline only) */}
                    {activeTab === "Accepted requests" && (
                      <button
                        className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                        onClick={() => openModal("Accept/Decline")}
                      >
                        Accept / Decline
                      </button>
                    )}

                    {/* CASE #2 👉 Accepted Offers → Show View button */}
                    {activeTab === "Accepted offers" && (
                      <button
                        className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                        onClick={() => openModal("View")}
                      >
                        View
                      </button>
                    )}

                    {/* CASE #3 👉 Pending → Show View/Edit button */}
                    {activeTab === "Pending" && (
                      <button
                        className="py-1.5 px-3 bg-[#F8FBFF] border rounded-[8px] text-[#3F72AF] font-semibold text-xs"
                        onClick={() => openModal("View/Edit")}
                      >
                        View / Edit
                      </button>
                    )}

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
        <>
          {/* 1️⃣ Accept / Decline modal */}
          {
            modelType === "Accept/Decline" && <AcceptDeclineModel
              openModal={modelType === "Accept/Decline" && modalOpen}
              setModalOpen={setModalOpen}
            />
          }
          {/* 2️⃣ View-only modal (Accepted offers) */}
          {modelType === "View" && <ViewModel
            openModal={modelType === "View" && modalOpen}
            setModalOpen={setModalOpen}
          />}
          {/* 3️⃣ View / Edit modal (Pending) */}
          {modelType === "View/Edit" && <ViewEditModel
            openModal={modelType === "View/Edit" && modalOpen}
            setModalOpen={setModalOpen}
          />}
        </>
      )}

    </div>
  );
};

export default SparePartsTable;



const AcceptDeclineModel = ({ openModal, setModalOpen }: any) => {
  interface SparePart {
    id: number;
    name: string;
    classType: string;
    qty: number;
    price: number;
  }
  const sampleData: SparePart[] = [
    { id: 1, name: "#1 Engine Block", classType: "A-class", qty: 1, price: 150 },
    { id: 2, name: "#2 Pistons", classType: "A-class", qty: 1, price: 150 },
    { id: 3, name: "#3 Cylinder Head", classType: "A-class", qty: 1, price: 150 },
  ];
  return (
    <ModalBox
      open={openModal}
      onOpenChange={setModalOpen}
      title={""}
      maxWidth="627px"
      bg="bg-gray-50"
    >
      <h2 className="text-[24px] text-gray-900 -mt-5">Required spare part</h2>
      <p className="mt-1 text-gray-600">
        For <span className="text-[#3F72AF] font-medium cursor-pointer hover:underline">
          New Engine Parts
        </span>{" "}
        of VIN{" "}
        <span className="text-[#3F72AF] cursor-pointer hover:underline">
          27393A7GDB67WOP921
        </span>
      </p>
      <hr className="my-5" />
      <div className="px-3">
        {/* Tabs */}
        <div className="mb-4">
          <button className="px-4 py-2 bg-[#DFE8F2] rounded-[8px] text-sm border text-[#495057] font-medium">
            Engine
          </button>
        </div>

        {/* Table Head */}
        <div className="grid grid-cols-4 text-sm font-semibold text-gray-600 mb-2">
          <span className="pl-2">Part name</span>
          <span className="pl-2">Class</span>
          <span className="pl-2">Qty</span>
          <span className="pl-2">Price</span>
        </div>

        {/* Items */}
        {sampleData.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-5 gap-3 mb-3 text-sm"
          >
            <input
              value={item.name}
              readOnly
              className="bg-gray-50 border col-span-2 border-gray-200 rounded-xl p-4 text-gray-800"
            />
            <input
              value={item.classType}
              readOnly
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            />
            <input
              type="number"
              value={item.qty}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-center"
            />
            <input
              value={item.price}
              readOnly
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800"
            />
          </div>
        ))}

        {/* Footer Buttons */}
        <div className="flex gap-6 justify-center mt-6">
          <button className="bg-[#3F72AF] hover:bg-[#2a578f] text-white font-medium px-6 py-3 rounded-xl">
            Accept
          </button>
          <button className="text-red-500 font-semibold hover:underline">
            Decline
          </button>
        </div>
      </div>

    </ModalBox>
  )
}


const ViewModel = ({ openModal, setModalOpen }: any) => {
  const classOptions = ["A-class", "B-class", "C-class"];

  const [parts, setParts] = useState([
    { id: 1, name: "#1 Engine Block", qty: 1, price: 150, classType: "A-class" },
    { id: 2, name: "#2 Pistons", qty: 1, price: 150, classType: "A-class" },
    { id: 3, name: "#3 Cylinder Head", qty: 1, price: 150, classType: "A-class" },
  ]);

  return (
    <ModalBox
      open={openModal}
      onOpenChange={setModalOpen}
      title=""
      maxWidth="627px"
      bg="bg-white"
    >
      {/* Top Header */}
      <div className="pb-1">
        <h2 className="text-[24px] text-gray-900 font-semibold -mt-5">
          Required spare part
        </h2>

        <p className="mt-1 text-gray-600 text-[15px]">
          For{" "}
          <span className="text-[#3F72AF] font-medium underline cursor-pointer">
            New Engine Parts
          </span>{" "}
          of VIN{" "}
          <span className="text-[#3F72AF] underline cursor-pointer">
            27393A7GDB67WOP921
          </span>
        </p>
      </div>

      <hr className="my-5 border-gray-200" />

      {/* Body Content */}
      <div className="px-3">
        <button className="px-5 py-2 mb-5 bg-[#E9EEF5] rounded-lg text-sm border border-gray-200 text-[#4B5563] font-medium">
          Engine
        </button>

        {/* Table Headers */}
        <div className="grid grid-cols-4 text-[14px] text-gray-600 font-semibold mb-2 px-1">
          <span>Part name</span>
          <span>Class</span>
          <span>Qty</span>
          <span>Price</span>
        </div>

        {/* Table Rows */}
        {parts.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 mb-3">

            <input
              value={item.name}
              readOnly
              className="bg-gray-50 col-span-5 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
            />

            {/* Dropdown */}
            <div className="relative col-span-3">
              <select
                value={item.classType}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm appearance-none w-full cursor-pointer"
              >
                {classOptions.map((cls) => (
                  <option key={cls}>{cls}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-3 top-4 text-gray-500 pointer-events-none" />
            </div>

            <input
              type="number"
              value={item.qty}
              readOnly
              className="bg-gray-50 border col-span-2 border-gray-200 rounded-xl p-4 text-gray-800 text-sm text-center"
            />

            <input
              value={item.price}
              readOnly
              className="bg-gray-50 border col-span-2 border-gray-200 rounded-xl p-4 text-gray-800 text-sm"
            />
          </div>
        ))}
      </div>

      {/* Footer Button */}
      <div className="px-2 mt-8">
        <button className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] transition text-white text-[16px] font-semibold py-4 rounded-xl shadow flex justify-center gap-3 items-center">
          <FiPhone size={20} />
          +994 55 995 47 65
        </button>
      </div>
    </ModalBox>
  );
};


const ViewEditModel = ({ openModal, setModalOpen }: any) => {
  const [parts, setParts] = useState([
    { id: 1, name: "#1 Engine Block", qty: "" },
    { id: 2, name: "#2 Pistons", qty: "" },
    { id: 3, name: "#3 Cylinder Head", qty: "" },
  ]);

  const handleAdd = () => {
    setParts([
      ...parts,
      { id: Date.now(), name: "", qty: "" }
    ]);
  };

  const handleRemove = (id: number) => {
    setParts(parts.filter((item) => item.id !== id));
  };

  const handleChange = (id: number, field: string, value: string) => {
    setParts(
      parts.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  return (
    <ModalBox
      open={openModal}
      onOpenChange={setModalOpen}
      title=""
      maxWidth="627px"
      bg="bg-gray-50"
    >
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-[24px] text-gray-900 font-semibold -mt-5">
          Required spare parts
        </h2>

        <p className="mt-1 text-gray-600 text-[15px] leading-tight">
          For{" "}
          <span className="text-[#3F72AF] underline cursor-pointer">
            New Engine Parts
          </span>{" "}
          of VIN{" "}
          <span className="text-[#3F72AF] underline cursor-pointer">
            27393A7GDB67WOP921
          </span>
        </p>
      </div>

      <hr className="my-5 border-gray-200" />

      <div className="px-2">

        {/* Tab */}
        <button className="mb-6 px-5 py-2 bg-[#E9EEF5] rounded-lg text-sm border border-gray-200 text-[#4B5563] font-medium">
          Engine
        </button>

        {/* Head row */}
        <div className="grid grid-cols-12 text-[14px] text-gray-600 font-semibold mb-2 px-1">
          <span className="col-span-7">Part name</span>
          <span className="col-span-3">Qty.</span>
          <span className="col-span-2 text-center">Delete</span>
        </div>

        {/* Input rows */}
        {parts.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 mb-3">
            <input
              value={item.name}
              onChange={(e) => handleChange(item.id, "name", e.target.value)}
              placeholder="Enter part name"
              className="col-span-7 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
            />

            <input
              value={item.qty}
              onChange={(e) => handleChange(item.id, "qty", e.target.value)}
              placeholder="Ex: 100"
              className="col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
            />

            <button
              onClick={() => handleRemove(item.id)}
              className="col-span-2 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-100 transition"
            >
              <RxCross2 size={18} className="text-gray-600" />
            </button>
          </div>
        ))}

        {/* Add spare button */}
        <button
          onClick={handleAdd}
          className="mt-3 flex items-center gap-2 bg-[#E9ECEF] px-5 py-3 rounded-lg text-gray-700 font-medium text-[12px] hover:bg-gray-100"
        >
          <FiPlus size={16} />
          Add spare part
        </button>

        {/* Footer */}
        <button className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] text-white text-[16px] font-semibold py-4 rounded-xl shadow mt-8">
          Update Request
        </button>
      </div>
    </ModalBox>
  );
};

