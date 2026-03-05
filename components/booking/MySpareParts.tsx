'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ModalBox from '../model-box-spareparts';

/* ---------- Types ---------- */
type SparePartItem = {
  id: number;
  spareparts_id: number;
  spareparts_type: string;
  state: 'new' | 'used' | string;
};

type BrandItem = {
  brand_id: number;
  name: string;
  enabled: boolean;
  status: 'active' | 'inactive' | string;
  available_spaeparts: SparePartItem[];
};

type ApiBrandSpareParts = {
  brand_id: number;
  brand_name: string;
  status: string;
  available_spaeparts: {
    id: number;
    spareparts_id: number;
    spareparts_type: string;
    state: string;
  }[];
};

type ApiBrand = { brandId: number; brandName: string };
type ApiSparePart = { sparepartsId: number; sparepartsType: string };

/* ---------- Small utils ---------- */
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

function safeGetBranchId() {
  try {
    return Number(localStorage.getItem('branch_id') || '1');
  } catch {
    return 1;
  }
}

function normalizeState(s: any) {
  const v = String(s ?? '').toLowerCase().trim();
  if (v === 'new' || v === 'used') return v;
  return v || 'new';
}

/* ---------- UI atoms ---------- */
const Toggle: React.FC<{
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    aria-pressed={checked}
    aria-disabled={disabled}
    onClick={() => !disabled && onChange(!checked)}
    className={cx(
      'w-[54px] h-[30px] rounded-full p-1 transition-colors',
      checked ? 'bg-[#3F72AF]' : 'bg-gray-300',
      disabled && 'opacity-60 cursor-not-allowed'
    )}
  >
    <span
      className={cx(
        'block w-[22px] h-[22px] bg-white rounded-full transition-transform',
        checked ? 'translate-x-6' : 'translate-x-0'
      )}
    />
  </button>
);

const Chip: React.FC<{
  label: string;
  subLabel?: string;
  onDelete?: () => void;
  deleteTitle?: string;
}> = ({ label, subLabel, onDelete, deleteTitle }) => (
  <div className="flex items-center justify-between gap-3 bg-[#F8F9FA] border border-[#E9ECEF] rounded-2xl px-4 py-3">
    <div className="min-w-0">
      <div className="text-sm font-medium text-[#212529] truncate">{label}</div>
      {subLabel ? <div className="text-xs text-[#6C757D]">{subLabel}</div> : null}
    </div>

    {onDelete ? (
      <button
        type="button"
        title={deleteTitle || 'Delete'}
        onClick={onDelete}
        className="shrink-0 text-[#D11A2A] hover:opacity-80 text-sm font-semibold"
      >
        Delete
      </button>
    ) : null}
  </div>
);

/* ---------- Checkbox dropdown ---------- */
const CheckListDropdown: React.FC<{
  label: string;
  buttonLabel: string;
  options: { value: number | string; text: string }[];
  selected: Array<number | string>;
  onToggle: (value: number | string) => void;
}> = ({ label, buttonLabel, options, selected, onToggle }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="text-sm font-medium text-[#212529] mb-1">{label}</div>

      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#212529]"
      >
        <span className="truncate">{buttonLabel}</span>
        <span className="ml-3 text-[#6C757D]">{open ? '▲' : '▼'}</span>
      </button>

      {open ? (
        <div
          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-auto"
          onMouseLeave={() => setOpen(false)}
        >
          {options.map((o) => {
            const isChecked = selected.includes(o.value);
            return (
              <label
                key={String(o.value)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onToggle(o.value)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-[#212529]">{o.text}</span>
              </label>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

/* ---------- Add New Modal ---------- */
const AddSparePartsModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (ok: boolean) => void;
}> = ({ open, onOpenChange, onSaved }) => {
  const [spareParts, setSpareParts] = useState<ApiSparePart[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [selectedSparepartsId, setSelectedSparepartsId] = useState<string>('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [selectedStates, setSelectedStates] = useState<Array<'new' | 'used'>>([]);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const [spRes, brRes] = await Promise.all([
          fetch(`${BASE_URL}/api/spare-parts`, { method: 'GET' }),
          fetch(`${BASE_URL}/api/brands`, { method: 'GET' }),
        ]);

        const spJson: any = await spRes.json().catch(() => []);
        const brJson: any = await brRes.json().catch(() => []);

        setSpareParts(Array.isArray(spJson) ? spJson : []);
        setBrands(Array.isArray(brJson) ? brJson : []);
      } catch {
        // ignore
      }
    })();
  }, [open]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: b.brandId, text: b.brandName })),
    [brands]
  );

  const stateOptions = useMemo(
    () => [
      { value: 'new', text: 'New' },
      { value: 'used', text: 'Used' },
    ],
    []
  );

  const brandButtonLabel = useMemo(() => {
    if (selectedBrandIds.length === 0) return 'Choose brands';
    if (selectedBrandIds.length === 1) {
      const b = brands.find((x) => x.brandId === selectedBrandIds[0]);
      return b ? b.brandName : '1 selected';
    }
    return `${selectedBrandIds.length} selected`;
  }, [selectedBrandIds, brands]);

  const stateButtonLabel = useMemo(() => {
    if (selectedStates.length === 0) return 'Choose states';
    if (selectedStates.length === 1) return selectedStates[0] === 'new' ? 'New' : 'Used';
    return `${selectedStates.length} selected`;
  }, [selectedStates]);

  const toggleBrand = (v: number | string) => {
    const id = Number(v);
    setSelectedBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleState = (v: number | string) => {
    const s = String(v) as 'new' | 'used';
    setSelectedStates((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const validate = () => {
    if (!selectedSparepartsId) {
      showToast('error', 'Please choose spare parts.');
      return false;
    }
    if (selectedBrandIds.length === 0) {
      showToast('error', 'Please choose at least one brand.');
      return false;
    }
    if (selectedStates.length === 0) {
      showToast('error', 'Please choose at least one state (New/Used).');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (saving) return;
    if (!validate()) return;

    const branchId = safeGetBranchId();
    const sparepartsId = Number(selectedSparepartsId);

    try {
      setSaving(true);
      let allOk = true;

      // Repeat calls: brand x state
      for (const brandId of selectedBrandIds) {
        for (const state of selectedStates) {
          const resp = await fetch(`${BASE_URL}/api/branch-brand-spareparts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              branchId,
              brandId,
              sparepartsId,
              state,
            }),
          });
          if (!resp.ok) allOk = false;
        }
      }

      if (allOk) {
        showToast('success', 'Record is added successfully');
        onSaved?.(true);
      } else {
        showToast('error', 'Fail to add the record');
        onSaved?.(false);
      }

      onOpenChange(false);
    } catch {
      showToast('error', 'Fail to add the record');
      onSaved?.(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBox open={open} onOpenChange={onOpenChange}>
      <div className="bg-white my-2 rounded-lg space-y-6">
        {toast ? (
          <div
            className={cx(
              'fixed top-6 right-6 z-[2000] px-4 py-3 rounded-xl shadow',
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            )}
          >
            {toast.message}
          </div>
        ) : null}

        <div className="p-6">
          <div className="text-lg font-semibold text-[#212529] mb-1">Add spare parts</div>
          <div className="text-sm text-[#6C757D] mb-4">Choose spare parts, brands and states.</div>

          {/* Spare Parts single select */}
          <div className="mb-4">
            <div className="text-sm font-medium text-[#212529] mb-1">Spare parts</div>
            <select
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#212529]"
              value={selectedSparepartsId}
              onChange={(e) => setSelectedSparepartsId(e.target.value)}
            >
              <option value="">Choose spare parts</option>
              {spareParts.map((s) => (
                <option key={s.sparepartsId} value={String(s.sparepartsId)}>
                  {s.sparepartsType}
                </option>
              ))}
            </select>
          </div>

          {/* Brands multi select */}
          <div className="mb-4">
            <CheckListDropdown
              label="Brands"
              buttonLabel={brandButtonLabel}
              options={brandOptions}
              selected={selectedBrandIds}
              onToggle={toggleBrand}
            />
          </div>

          {/* States multi select */}
          <div className="mb-6">
            <CheckListDropdown
              label="State"
              buttonLabel={stateButtonLabel}
              options={stateOptions}
              selected={selectedStates}
              onToggle={toggleState}
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-[#212529] bg-white"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={save}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#3F72AF] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </ModalBox>
  );
};

/* ---------- Main component ---------- */
const MySpareParts: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const load = async () => {
    const branchId = safeGetBranchId();
    try {
      setLoading(true);
      const resp = await fetch(`${BASE_URL}/api/spareparts/by-branch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: branchId }),
      });
      const json: any = await resp.json().catch(() => []);
      const list: ApiBrandSpareParts[] = Array.isArray(json) ? json : [];
      const mapped: BrandItem[] = list.map((b) => ({
        brand_id: b.brand_id,
        name: b.brand_name,
        status: b.status,
        enabled: String(b.status).toLowerCase() === 'active',
        available_spaeparts: (b.available_spaeparts || []).map((x) => ({
          id: x.id,
          spareparts_id: x.spareparts_id,
          spareparts_type: x.spareparts_type,
          state: normalizeState(x.state),
        })),
      }));
      setBrands(mapped);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleBrandStatus = async (brandId: number, nextEnabled: boolean) => {
    const branchId = safeGetBranchId();
    const status = nextEnabled ? 'active' : 'inactive';

    // optimistic
    setBrands((prev) =>
      prev.map((b) => (b.brand_id === brandId ? { ...b, enabled: nextEnabled, status } : b))
    );

    try {
      const resp = await fetch(`${BASE_URL}/api/ba/branch-brand-spare-part/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          brand_id: brandId,
          status,
        }),
      });

      if (!resp.ok) {
        showToast('error', 'Failed to update status');
        // rollback
        setBrands((prev) =>
          prev.map((b) => (b.brand_id === brandId ? { ...b, enabled: !nextEnabled, status: !nextEnabled ? 'active' : 'inactive' } : b))
        );
      }
    } catch {
      showToast('error', 'Failed to update status');
      // rollback
      setBrands((prev) =>
        prev.map((b) => (b.brand_id === brandId ? { ...b, enabled: !nextEnabled, status: !nextEnabled ? 'active' : 'inactive' } : b))
      );
    }
  };

  const handleDeleteSparePart = async (rowId: number) => {
    try {
      const resp = await fetch(`${BASE_URL}/api/branch-brand-spareparts/${rowId}`, {
        method: 'DELETE',
      });
      if (resp.ok) {
        showToast('success', 'Deleted successfully');
        load();
      } else {
        showToast('error', 'Failed to delete');
      }
    } catch {
      showToast('error', 'Failed to delete');
    }
  };

  return (
    <div className="w-full">
      {toast ? (
        <div
          className={cx(
            'fixed top-6 right-6 z-[2000] px-4 py-3 rounded-xl shadow',
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      ) : null}

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xl font-semibold text-[#212529]">My Spare parts</div>
          <div className="text-sm text-[#6C757D]">Manage spare parts by brand.</div>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="text-[#3F72AF] font-semibold text-sm hover:underline"
        >
          + Add new
        </button>
      </div>

      {loading ? <div className="text-sm text-[#6C757D]">Loading...</div> : null}

      <div className="space-y-4">
        {brands.map((b) => (
          <div key={b.brand_id} className="bg-white border border-[#E9ECEF] rounded-3xl p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base font-semibold text-[#212529] truncate">{b.name}</div>
                <div className="text-xs text-[#6C757D]">
                  Status: <span className="font-semibold">{b.enabled ? 'Active' : 'Inactive'}</span>
                </div>
              </div>

              <Toggle checked={b.enabled} onChange={(next) => toggleBrandStatus(b.brand_id, next)} />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {b.available_spaeparts?.length ? (
                b.available_spaeparts.map((sp) => (
                  <Chip
                    key={sp.id}
                    label={sp.spareparts_type}
                    subLabel={`State: ${String(sp.state).toUpperCase()}`}
                    onDelete={() => handleDeleteSparePart(sp.id)}
                    deleteTitle="Delete spare part"
                  />
                ))
              ) : (
                <div className="text-sm text-[#6C757D]">No spare parts.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddSparePartsModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSaved={() => load()}
      />
    </div>
  );
};

export default MySpareParts;
