import React, { useCallback, useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ModalBox from "../model-box";
import BranchModel from "./BranchModel";

// ---- API types ----
type BranchCard = {
  branchId: number;
  companyId: number;
  branchName: string;
  branchCode: string;
  branchManagerName: string;
  branchManagerSurname: string;
  branchAddress: string;
  location: string;
  loginEmail: string;
  password?: string;
  logoImg?: string;
  branchCoverImg?: string;
  status?: string;
  latitude?: number;
  longitude?: number;
  city: string;
  address?: string;
  workDays?: string[];
  from?: string;
  to?: string;
};

type ToastState = { show: boolean; msg: string; variant: "success" | "error" };

const MyBranches: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [rows, setRows] = useState<BranchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [toast, setToast] = useState<ToastState>({ show: false, msg: "", variant: "success" });

  const showToast = (msg: string, variant: "success" | "error" = "success") => {
    setToast({ show: true, msg, variant });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2500);
  };

  // ✅ FIXED: company_id must be read from auth_response, not from "companyId" key
  const getCompanyId = () => {
    try {
      const authRaw = localStorage.getItem("auth_response");
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        const cid = parsed?.company_id ?? parsed?.companyId;
        if (cid) return Number(cid);
      }
    } catch (e) {
      console.error("Error reading company_id from auth_response:", e);
    }
    return 1; // fallback
  };

  const fetchBranches = useCallback(async () => {
    const companyId = getCompanyId(); // 🔥 NEW CORRECT SOURCE

    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`${BASE_URL}/api/branches/company`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId }),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      const data: BranchCard[] = await resp.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const onEdit = (branchId: number) => {
    setEditingBranchId(branchId);
    setOpenModal(true);
  };

  const onAddNew = () => {
    setEditingBranchId(null);
    setOpenModal(true);
  };

  const onSaved = () => {
    setOpenModal(false);
    setEditingBranchId(null);
    fetchBranches();
    showToast("Branch updated successfully.", "success");
  };

  const onDelete = async (branchId: number) => {
    try {
      const resp = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      showToast("Branch deleted.", "success");
      await fetchBranches();
    } catch (e: any) {
      showToast(e?.message || "Delete failed", "error");
    }
  };

  const cards = useMemo(() => rows || [], [rows]);

  return (
    <>
      <section className="pb-20">
        <div className="flex gap-6 text-sm items-center mb-6">
          <h2 className="text-gray-700 font-medium">Branches</h2>
          <button onClick={onAddNew} className="font-medium text-gray-400 hover:text-gray-700">
            + Add new
          </button>
        </div>

        {loading && <div className="py-10 text-gray-500">Loading...</div>}
        {error && !loading && <div className="py-10 text-red-600">{error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((b) => (
              <div key={b.branchId} className="rounded-2xl bg-white p-6 relative border">
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <div className="absolute top-4 right-4 cursor-pointer text-gray-400 text-xl">⋮</div>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Content className="min-w-[170px] bg-white border rounded-md p-1 z-50" sideOffset={5}>
                    <DropdownMenu.Item
                      className="px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer rounded"
                      onClick={() => onEdit(b.branchId)}
                    >
                      Edit
                    </DropdownMenu.Item>

                    <DropdownMenu.Item
                      className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer rounded"
                      onClick={() => onDelete(b.branchId)}
                    >
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>

                <h3 className="text-[#3F72AF] font-medium text-lg mb-1">{b.branchName}</h3>
                <p className="text-sm text-gray-500 mb-4">{b.branchCode}</p>

                <p className="text-sm text-gray-400 mb-1">Branch manager</p>
                <p className="text-sm text-gray-700 mb-4">
                  {b.branchManagerName} {b.branchManagerSurname}
                </p>

                <p className="text-sm text-gray-400 mb-1">Address</p>
                <p className="text-sm text-gray-700">
                  {b.branchAddress}
                  {b.city ? `, ${b.city}` : ""}
                </p>

                <a href={b.location} target="_blank" rel="noopener noreferrer" className="text-sm text-[#3F72AF] underline">
                  Google Map
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      <ModalBox
        open={openModal}
        onOpenChange={setOpenModal}
        title={editingBranchId ? "Edit branch" : "Add branch"}
        maxWidth="920px"
        bg="bg-gray-50"
      >
        <BranchModel
          branchId={editingBranchId ?? undefined}
          mode={editingBranchId ? "edit" : "create"}
          onSaved={onSaved}
          onClose={() => setOpenModal(false)}
          onToast={(m, v) => showToast(m, v)}
        />
      </ModalBox>

      {toast.show && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] rounded-xl px-4 py-3 shadow-lg text-white ${
            toast.variant === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default MyBranches;
