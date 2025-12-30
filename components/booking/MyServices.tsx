'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ModalBox from '../model-box';

/* ---------- Types ---------- */
type BrandItem = {
  brand_id: number;
  id: number | string;
  name: string;
  enabled: boolean;
  services: { id: number; service_name: string; status: string }[];
};

type ApiBrandServices = {
  brand_id: number;
  brand_name: string;
  status: string;
  available_services: { id: number; service_name: string; status: string }[];
};
type ApiBrand = { brandId: number; brandName: string };
type ApiService = { serviceId: number; serviceName: string };

/* ---------- Small utils ---------- */
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* ---------- UI atoms ---------- */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Toggle: React.FC<{
  brandId: number;
  checked: boolean;
  onChange: (brandId: number, next: boolean) => void;
  disabled?: boolean;
}> = ({ brandId, checked, onChange, disabled }) => (
  <button
    type="button"
    aria-pressed={checked}
    aria-disabled={disabled}
    onClick={() => !disabled && onChange(brandId, !checked)}
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

/* ---------- Service Pill (with delete) ---------- */
const ServicePill: React.FC<{
  label: string;
  serviceId: number;
  onDelete: (id: number) => void;
}> = ({ label, serviceId, onDelete }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-xs text-gray-700">
    {label}
    <button
      onClick={() => onDelete(serviceId)}
      className="ml-1 text-gray-400 hover:text-red-500"
      title="Delete service"
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-3.5 w-3.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-2-3h-2a1 1 0 00-1 1v1h4V5a1 1 0 00-1-1z"
        />
      </svg>
    </button>
  </span>
);

/* ---------- Modal: Add Service (selectors visible) ---------- */
type AddServiceSelectorProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: (success: boolean) => void;
};

const AddServiceSelector: React.FC<AddServiceSelectorProps> = ({
  open,
  onOpenChange,
  onSaved,
}) => {
  const [services, setServices] = useState<ApiService[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<number | ''>('');
  const [selectedBrandIds, setSelectedBrandIds] = useState<number[]>([]);
  const [qty, setQty] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const BASE = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  // Ensure a branch_id exists
  useEffect(() => {
    if (!localStorage.getItem('branch_id')) localStorage.setItem('branch_id', '1');
  }, []);

  // Toast helper
  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Load services & brands each time the modal opens
  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const [srv, br] = await Promise.all([
          fetch(`${BASE}/api/services`),
          fetch(`${BASE}/api/brands`),
        ]);
        const srvJson: ApiService[] = await srv.json();
        const brJson: ApiBrand[] = await br.json();
        setServices(srvJson || []);
        setBrands(brJson || []);
        setSelectedServiceId('');
        setSelectedBrandIds([]);
        setQty(1);
      } catch (e: any) {
        showToast('error', e?.message || 'Unable to load options.');
      }
    };
    load();
  }, [open]);

  const toggleBrand = (id: number) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
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
      let allSuccess = true;

      for (const brandId of selectedBrandIds) {
        const resp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/branch-brand-services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            branchId,
            brandId,
            serviceId: Number(selectedServiceId),
            qty,
          }),
        });
        if (!resp.ok) allSuccess = false;
      }

      if (allSuccess) {
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

  const brandButtonLabel = useMemo(() => {
    if (selectedBrandIds.length === 0) return 'Choose the brand';
    if (selectedBrandIds.length === 1) {
      const b = brands.find((x) => x.brandId === selectedBrandIds[0]);
      return b ? b.brandName : '1 selected';
    }
    return `${selectedBrandIds.length} selected`;
  }, [selectedBrandIds, brands]);

  return (
    <div className="bg-white my-2 rounded-lg space-y-6">
      {/* Toast */}
      {toast && (
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
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Service select */}
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
          </div>
        </div>

        {/* Brands dropdown (checkbox list) */}
        <div className="md:col-span-2">
          <label className="block mb-2 text-sm font-medium text-gray-600">Select the car brands *</label>
          <div className="relative">
            <button
              type="button"
              className="w-full p-3 pr-10 border rounded-[12px] text-left text-gray-700"
              onClick={() => setBrandDropdownOpen((o) => !o)}
            >
              {brandButtonLabel}
            </button>

            {brandDropdownOpen && (
              <div className="absolute z-[2001] mt-2 w-full rounded-[12px] border bg-white shadow-lg max-h-56 overflow-auto p-2">
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

        {/* Quantity */}
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

      {/* Save */}
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

/* ---------- Grid + modal wrapper ---------- */
const BrandServicesGrid: React.FC<{
  items: BrandItem[];
  onRefresh: () => void;
  className?: string;
}> = ({ items, onRefresh, className }) => {
  const [openModal, setOpenModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  // Toggle status per brand
  const handleToggle = async (brandId: number, next: boolean) => {
    const branch_id = Number(localStorage.getItem('branch_id') || '1');
    const status = next ? 'active' : 'inactive';

    try {
      const resp = await fetch(`${BASE_URL}/api/branch-brand-services/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id, brand_id: brandId, status }),
      });

      if (!resp.ok) throw new Error('Failed to update status');
      showToast('success', `Status updated to ${status}`);
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Error updating status');
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      const resp = await fetch(`${BASE_URL}/api/branch-brand-services/${serviceId}`, {
        method: 'DELETE',
      });
    if (!resp.ok) throw new Error('Failed to delete service');
      showToast('success', 'Service deleted successfully.');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  return (
    <>
      {/* Toast */}
      {toast && (
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
      )}

      <div className={cx('w-full', className)}>
        {/* Header */}
        <div className="mb-4 flex items-center gap-9">
          <div className="text-sm font-medium text-[#495057]">Services</div>
          <button
            type="button"
            onClick={() => setOpenModal(true)}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800"
          >
            <span className="text-lg leading-none">＋</span>
            <span>Add new</span>
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.brand_id} className="rounded-2xl bg-white p-6 relative">
              {/* Top row */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Toggle brandId={b.brand_id} checked={b.enabled} onChange={handleToggle} />
                  <span className="text-sm font-medium text-[#495057]">{b.name}</span>
                </div>
              </div>

              {/* Pills with delete */}
              <div className="flex flex-wrap gap-2">
                {b.services.map((srv) => (
                  <ServicePill
                    key={`${b.id}-${srv.id}`}
                    label={srv.service_name}
                    serviceId={srv.id}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controlled Modal */}
      <ModalBox
        open={openModal}
        onOpenChange={setOpenModal}
        title="Add Service"
        maxWidth="808px"
      >
        <AddServiceSelector
          open={openModal}
          onOpenChange={setOpenModal}
          onSaved={(success) => {
            if (success) {
              showToast('success', 'Record is added successfully');
              onRefresh(); // re-fetch to re-render ServicePill
            } else {
              showToast('error', 'Fail to add the record');
            }
          }}
        />
      </ModalBox>
    </>
  );
};

/* ---------- Main component ---------- */
export default function MyServices() {
  const [items, setItems] = useState<BrandItem[]>([]);

  const mapServerToItems = (rows: ApiBrandServices[]): BrandItem[] =>
    (rows || []).map((r, idx) => {
      const allActive =
        Array.isArray(r.available_services) &&
        r.available_services.every((s) => s.status?.toLowerCase() === 'active');
      return {
        id: r.brand_name || idx + 1,
        brand_id: r.brand_id,
        name: r.brand_name,
        enabled: allActive,
        services: Array.isArray(r.available_services)
          ? r.available_services.map((s) => ({
              id: s.id,
              service_name: s.service_name,
              status: s.status,
            }))
          : [],
      };
    });

  const fetchGrid = async () => {
    const branch_id = Number(localStorage.getItem('branch_id') || '1');
    const resp = await fetch(`${BASE_URL}/api/branch-services/by-branch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ branch_id }),
    });
    const data: ApiBrandServices[] = await resp.json();
    setItems(mapServerToItems(data));
  };

  useEffect(() => {
    if (!localStorage.getItem('branch_id')) localStorage.setItem('branch_id', '1');
    fetchGrid().catch(() => setItems([]));
  }, []);

  return (
    <div>
      <BrandServicesGrid items={items} onRefresh={fetchGrid} />
    </div>
  );
}
