'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import ModalBox from '../model-box';

/* ---------- Types ---------- */
type BrandItem = {
  id: number | string;
  name: string;
  enabled: boolean;
  services: string[];
};

type ApiBrandServices = { brand_name: string; status: string; available_services: string[] };
type ApiBrand = { brandId: number; brandName: string };
type ApiService = { serviceId: number; serviceName: string };

/* ---------- Small utils ---------- */
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* ---------- UI atoms ---------- */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
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
      'relative inline-flex h-6 w-[43px] items-center rounded-full transition-colors',
      checked ? 'bg-[#6EDE8A]' : 'bg-gray-300',
      disabled && 'opacity-50 cursor-not-allowed'
    )}
  >
    <span
      className={cx(
        'inline-block h-5 w-5 transform rounded-full bg-white transition-transform',
        checked ? 'translate-x-5' : 'translate-x-1'
      )}
    />
  </button>
);

const ServicePill: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-xs text-gray-700">
    {label}
  </span>
);

/* ---------- Modal: Add/Edit ---------- */
type AddServiceSelectorProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
  presetBrandName?: string | null; // when opened via Edit
};

const AddServiceSelector: React.FC<AddServiceSelectorProps> = ({
  open,
  onOpenChange,
  onSaved,
  presetBrandName = null,
}) => {
  const [services, setServices] = useState<ApiService[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // brands dropdown with checkboxes
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('branch_id')) localStorage.setItem('branch_id', '1');
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Load options when modal opens
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const [srv, br] = await Promise.all([
          fetch(`${BASE_URL}/api/services`),
          fetch(`${BASE_URL}/api/brands`),
        ]);
        if (!srv.ok) throw new Error(`Failed to load services (HTTP ${srv.status})`);
        if (!br.ok) throw new Error(`Failed to load brands (HTTP ${br.status})`);
        const srvJson: ApiService[] = await srv.json();
        const brJson: ApiBrand[] = await br.json();
        setServices(srvJson || []);
        setBrands(brJson || []);

        // If opened from Edit and we can match a brand by name, preselect it
        if (presetBrandName) {
          const match = brJson.find(
            (b) => b.brandName.trim().toLowerCase() === presetBrandName.trim().toLowerCase()
          );
          setSelectedBrandIds(match ? [match.brandId] : []);
        } else {
          setSelectedBrandIds([]);
        }
        setSelectedServiceId('');
        setQty(1);
      } catch (e: any) {
        showToast('error', e?.message || 'Unable to load options.');
      }
    };
    load();
  }, [open, presetBrandName]);

  const toggleBrand = (id: number) => {
    setSelectedBrandIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const validate = () => {
    if (!selectedServiceId) {
      showToast('error', 'Please select a service.');
      return false;
    }
    if (selectedBrandIds.length === 0) {
      showToast('error', 'Please select at least one brand.');
      return false;
    }
    if (qty < 1) {
      showToast('error', 'Quantity must be at least 1.');
      return false;
    }
    return true;
  };

  const save = async () => {
    if (saving) return;
    if (!validate()) return;

    try {
      setSaving(true);
      const branchId = Number(localStorage.getItem('branch_id') || '1');

      // Loop and send one by one
      for (const brandId of selectedBrandIds) {
        const resp = await fetch(`${BASE_URL}/api/branch-brand-services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchId,
            brandId,
            serviceId: Number(selectedServiceId),
            qty,
          }),
        });
        if (!resp.ok) {
          const txt = await resp.text().catch(() => '');
          throw new Error(txt || `Save failed (HTTP ${resp.status})`);
        }
      }

      showToast('success', 'Saved successfully.');
      onSaved?.();
      onOpenChange(false);
    } catch (e: any) {
      showToast('error', e?.message || 'Unexpected error while saving.');
    } finally {
      setSaving(false);
    }
  };

  // Helper to render label for brand dropdown button
  const brandButtonLabel = useMemo(() => {
    if (selectedBrandIds.length === 0) return 'Choose the brand';
    if (selectedBrandIds.length === 1) {
      const b = brands.find((x) => x.brandId === selectedBrandIds[0]);
      return b ? b.brandName : '1 selected';
    }
    return `${selectedBrandIds.length} selected`;
  }, [selectedBrandIds, brands]);

  return (
    <div className="bg-white my-6 rounded-lg space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={cx(
            'fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow',
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      {/* Keep same grid/layout as your popup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Select the services (single) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-blue-500">Select the services *</label>
          <div className="relative">
            <select
              value={String(selectedServiceId)}
              onChange={(e) => setSelectedServiceId(e.target.value ? Number(e.target.value) : '')}
              className="w-full p-3 pr-10 border rounded-[12px] text-gray-700 appearance-none"
            >
              <option value="">Select the service</option>
              {services.map((s) => (
                <option key={s.serviceId} value={s.serviceId}>
                  {s.serviceName}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Select the car brands (dropdown with checkboxes) */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-600">Select the car brands *</label>
          <div className="relative">
            {/* Button styled like your inputs */}
            <button
              type="button"
              className="w-full p-3 pr-10 border rounded-[12px] text-left text-gray-700"
              onClick={() => setBrandDropdownOpen((o) => !o)}
            >
              {brandButtonLabel}
            </button>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {brandDropdownOpen && (
              <div className="absolute z-20 mt-2 w-full rounded-[12px] border bg-white shadow-lg max-h-56 overflow-auto p-2">
                {brands.length === 0 ? (
                  <p className="text-sm text-gray-400 px-2 py-1">No brands found.</p>
                ) : (
                  brands.map((b) => (
                    <label key={b.brandId} className="flex items-center gap-3 px-2 py-1 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={selectedBrandIds.includes(b.brandId)}
                        onChange={() => toggleBrand(b.brandId)}
                      />
                      <span>{b.brandName}</span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Select Box quantity (±1, min 1) */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">Select Box quantity *</label>
          <div className="flex items-center border rounded-[12px] px-4 py-2.5 w-full justify-between">
            <button
              type="button"
              className="text-lg text-gray-400 hover:text-gray-600"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-gray-700 font-medium">{qty}</span>
            <button
              type="button"
              className="text-lg text-gray-400 hover:text-gray-600"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Save button (new) */}
      <div>
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={cx(
            'flex items-center gap-2 px-5 py-3 rounded-[12px] text-white font-medium',
            saving ? 'bg-[#9AB6DB] cursor-not-allowed' : 'bg-[#3F72AF] hover:bg-blue-600'
          )}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};

/* ---------- Grid + modal ---------- */
const BrandServicesGrid: React.FC<{
  items: BrandItem[];
  onToggle?: (id: BrandItem['id'], next: boolean) => void;
  className?: string;
}> = ({ items, onToggle, className }) => {
  const [openModal, setOpenModal] = useState(false);
  const [editBrandName, setEditBrandName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <>
      {toast && (
        <div
          className={cx(
            'fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow',
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}

      <div className={cx('w-full', className)}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-9">
          <div className="text-sm font-medium text-[#495057]">Services</div>
          <button
            type="button"
            onClick={() => {
              setEditBrandName(null); // adding new
              setOpenModal(true);
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800"
          >
            <span className="text-lg leading-none">＋</span>
            <span>Add new</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-6 relative">
              {/* Top row: toggle + brand + Pencil dropdown */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Toggle checked={b.enabled} onChange={(v) => onToggle?.(b.id, v)} />
                  <span className="text-sm font-medium text-[#495057]">{b.name}</span>
                </div>

                {/* Dropdown with only Edit (Duplicate/Remove removed) */}
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button
                      type="button"
                      className="rounded p-1 hover:bg-gray-50"
                      aria-label={`Actions for ${b.name}`}
                      title="Actions"
                    >
                      <img src="/icons/edit-02.svg" alt="pencil" width={16} />
                    </button>
                  </DropdownMenu.Trigger>

                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      sideOffset={6}
                      align="end"
                      className="z-50 min-w-[160px] rounded-md bg-white p-1 shadow-lg ring-1 ring-black/5 border border-gray-200"
                    >
                      <DropdownMenu.Item
                        className="px-3 py-2 text-sm text-gray-700 rounded outline-none cursor-pointer data-[highlighted]:bg-gray-100 data-[highlighted]:text-gray-900"
                        onClick={() => {
                          setEditBrandName(b.name);
                          setOpenModal(true);
                        }}
                      >
                        Edit
                      </DropdownMenu.Item>

                      <DropdownMenu.Arrow className="fill-white" />
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              </div>

              {/* Pills */}
              <div className="flex flex-wrap gap-2">
                {b.services.map((s, i) => (
                  <ServicePill key={`${b.id}-${i}-${s}`} label={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Keep your existing ModalBox wrapper and layout */}
      <ModalBox
        open={openModal}
        onOpenChange={(open: boolean) => setOpenModal(open)}
        title={editBrandName ? 'Edit Service' : 'Add Service'}
        maxWidth="808px"
      >
        <AddServiceSelector
          open={openModal}
          onOpenChange={setOpenModal}
          onSaved={() => showToast('success', 'Record(s) saved.')}
          presetBrandName={editBrandName}
        />
      </ModalBox>
    </>
  );
};

/* ---------- Page wrapper (fetch & map) ---------- */
export default function MyServices() {
  const [items, setItems] = useState<BrandItem[]>([]);

  const mapServerToItems = (rows: ApiBrandServices[]): BrandItem[] =>
    (rows || []).map((r, idx) => ({
      id: r.brand_name || idx + 1,
      name: r.brand_name,
      enabled: r.status?.toLowerCase() === 'active',
      services: Array.isArray(r.available_services) ? r.available_services : [],
    }));

  const fetchGrid = async () => {
    const branch_id = Number(localStorage.getItem('branch_id') || '1');
    const resp = await fetch(`${BASE_URL}/api/branch-services/by-branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch_id }),
    });
    if (!resp.ok) throw new Error(`Failed to load (HTTP ${resp.status})`);
    const data: ApiBrandServices[] = await resp.json();
    setItems(mapServerToItems(data));
  };

  useEffect(() => {
    // ensure default
    if (!localStorage.getItem('branch_id')) localStorage.setItem('branch_id', '1');
    fetchGrid().catch(() => setItems([]));
  }, []);

  const onToggle = (id: BrandItem['id'], next: boolean) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
  };

  return (
    <div>
      <BrandServicesGrid items={items} onToggle={onToggle} />
    </div>
  );
}
