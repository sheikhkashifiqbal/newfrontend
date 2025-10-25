'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import ModalBox from '../model-box';

/* ---------- Types ---------- */
type BrandItem = {
  id: number | string;
  name: string;
  enabled: boolean;
  services: { id: number; service_name: string }[];
};

type ApiBrandServices = {
  brand_name: string;
  status: string;
  available_services: { id: number; service_name: string }[];
};
type ApiBrand = { brandId: number; brandName: string };
type ApiService = { serviceId: number; serviceName: string };

/* ---------- Small utils ---------- */
function cx(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

/* ---------- UI atoms ---------- */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081';

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

/* ---------- Service Pill with delete ---------- */
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

/* ---------- Modal: Add/Edit (unchanged) ---------- */
type AddServiceSelectorProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved?: () => void;
  presetBrandName?: string | null;
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

  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('branch_id')) localStorage.setItem('branch_id', '1');
  }, []);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      try {
        const [srv, br] = await Promise.all([
          fetch(`${BASE_URL}/api/services`),
          fetch(`${BASE_URL}/api/brands`),
        ]);
        const srvJson: ApiService[] = await srv.json();
        const brJson: ApiBrand[] = await br.json();
        setServices(srvJson || []);
        setBrands(brJson || []);
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
        if (!resp.ok) throw new Error(`Save failed (HTTP ${resp.status})`);
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
      {toast && (
        <div
          className={cx(
            'fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow',
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
        >
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="absolute z-20 mt-2 w-full rounded-[12px] border bg-white shadow-lg max-h-56 overflow-auto p-2">
                {brands.map((b) => (
                  <label key={b.brandId} className="flex items-center gap-3 px-2 py-1 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedBrandIds.includes(b.brandId)}
                      onChange={() => toggleBrand(b.brandId)}
                    />
                    <span>{b.brandName}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium text-gray-600">Select Box quantity *</label>
          <div className="flex items-center border rounded-[12px] px-4 py-2.5 w-full justify-between">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="text-lg text-gray-400 hover:text-gray-600"
            >
              −
            </button>
            <span className="text-gray-700 font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="text-lg text-gray-400 hover:text-gray-600"
            >
              +
            </button>
          </div>
        </div>
      </div>

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
  onRefresh: () => void;
  className?: string;
}> = ({ items, onToggle, onRefresh, className }) => {
  const [openModal, setOpenModal] = useState(false);
  const [editBrandName, setEditBrandName] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 2500);
  };

  const handleDeleteService = async (serviceId: number) => {
    try {
      const resp = await fetch(`${BASE_URL}/api/branch-brand-services/${serviceId}`, {
        method: 'DELETE',
      });
      if (!resp.ok) throw new Error(`Failed to delete (HTTP ${resp.status})`);
      showToast('success', 'Service deleted successfully.');
      onRefresh();
    } catch (err: any) {
      showToast('error', err.message || 'Error deleting service.');
    }
  };

  return (
    <>
      {toast && (
        <div
          className={cx(
            'fixed top-6 right-6 z-50 px-4 py-3 rounded-xl shadow',
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          )}
        >
          {toast.message}
        </div>
      )}

      <div className={cx('w-full', className)}>
        <div className="mb-4 flex items-center gap-9">
          <div className="text-sm font-medium text-[#495057]">Services</div>
          <button
            type="button"
            onClick={() => {
              setEditBrandName(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800"
          >
            <span className="text-lg leading-none">＋</span>
            <span>Add new</span>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((b) => (
            <div key={b.id} className="rounded-2xl bg-white p-6 relative">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Toggle checked={b.enabled} onChange={(v) => onToggle?.(b.id, v)} />
                  <span className="text-sm font-medium text-[#495057]">{b.name}</span>
                </div>
              {/*
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
                */
                  }
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

/* ---------- Page wrapper ---------- */
export default function MyServices() {
  const [items, setItems] = useState<BrandItem[]>([]);

  const mapServerToItems = (rows: ApiBrandServices[]): BrandItem[] =>
    (rows || []).map((r, idx) => ({
      id: r.brand_name || idx + 1,
      name: r.brand_name,
      enabled: r.status?.toLowerCase() === 'active',
      services: Array.isArray(r.available_services)
        ? r.available_services.map((s) => ({
            id: s.id,
            service_name: s.service_name,
          }))
        : [],
    }));

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

  const onToggle = (id: BrandItem['id'], next: boolean) => {
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: next } : x)));
  };

  return (
    <div>
      <BrandServicesGrid items={items} onToggle={onToggle} onRefresh={fetchGrid} />
    </div>
  );
}
