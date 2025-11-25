'use client'
import { memo, useEffect, useMemo, useState } from "react";
import * as React from "react";
import { ShopDistanceSelector } from "@/components/spare-parts/spare-parts-search-results/shop-distance-selector";
import ServiceLogo from '@/assets/icons/services/ServiceLogo.svg'
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import YellowStar from '@/assets/icons/services/YellowStarIcon.svg'
import ModalBox from "@/components/spareparts-model-box";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ---------- Types from response ----------
type SparePartResult = {
  branch_id: number;
  branch_name: string;
  logo_img: string;          // image file name
  state: string[];           // ["new","used"] | ["new"] | ["used"]
  spareparts_type: string;   // e.g., "Brakes"
  latitude: number;
  longitude: number;
  stars: number;             // rating number
};

type SortOrder = 'all' | 'closest' | 'farthest';

type PartRow = { id: number; name: string; qty: string };

// ---------- Haversine distance (km) ----------
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatState(stateArr: string[]) {
  if (!Array.isArray(stateArr) || stateArr.length === 0) return 'All';
  const s = new Set(stateArr.map(s => s?.toLowerCase()));
  if (s.has('new') && s.has('used')) return 'All';
  if (s.has('new')) return 'new';
  if (s.has('used')) return 'used';
  return 'All';
}

// ===================== POPUP COMPONENT (Make Reservation) START =====================
const ViewEditModel = ({
  openModal,
  setModalOpen,
  sparepartsId,
  branchId,
  spareTypeLabel,
  vin,
  onVinChange,
  showToast,
  initialParts,
}: {
  openModal: boolean;
  setModalOpen: (open: boolean) => void;
  sparepartsId: number | null;
  branchId: number | null;
  spareTypeLabel: string;
  vin: string;
  onVinChange: (val: string) => void;
  showToast: (type: "success" | "error", message: string) => void;
  initialParts?: PartRow[];
}) => {
  const [parts, setParts] = useState<PartRow[]>(() => {
    if (initialParts && initialParts.length) {
      return initialParts.map((p, idx) => ({
        id: p.id ?? Date.now() + idx,
        name: p.name ?? "",
        qty: p.qty ?? "",
      }));
    }
    return [
      { id: 1, name: "", qty: "" },
      { id: 2, name: "", qty: "" },
      { id: 3, name: "", qty: "" },
    ];
  });

  const [errors, setErrors] = useState<{
    [key: number]: { name?: string; qty?: string };
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If initialParts change while modal is open, sync them
  useEffect(() => {
    if (initialParts && initialParts.length) {
      setParts(
        initialParts.map((p, idx) => ({
          id: p.id ?? Date.now() + idx,
          name: p.name ?? "",
          qty: p.qty ?? "",
        }))
      );
    }
  }, [initialParts]);

  const handleAdd = () => {
    setParts([
      ...parts,
      { id: Date.now(), name: "", qty: "" }
    ]);
  };

  const handleRemove = (id: number) => {
    setParts(parts.filter((item) => item.id !== id));
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleChange = (id: number, field: "name" | "qty", value: string) => {
    setParts(
      parts.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
    setErrors((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        copy[id] = {
          ...copy[id],
          [field]: "",
        };
      }
      return copy;
    });
  };

  const validateParts = () => {
    const newErrors: {
      [key: number]: { name?: string; qty?: string };
    } = {};

    parts.forEach((p) => {
      const hasName = p.name.trim().length > 0;
      const hasQty = p.qty.trim().length > 0;

      if (!hasName || !hasQty) {
        newErrors[p.id] = {
          name: !hasName ? "Part name is required." : "",
          qty: !hasQty ? "Qty is required." : "",
        };
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate part rows
    const valid = validateParts();
    if (!valid) return;

    if (!sparepartsId || !branchId) {
      showToast("error", "Missing required data to submit request.");
      return;
    }

    try {
      setIsSubmitting(true);

      // Read userId from localStorage (auth_response)
      const raw = typeof window !== "undefined" ? localStorage.getItem("auth_response") : null;
      let userId: number | null = null;

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed && typeof parsed.id === "number") {
            userId = parsed.id;
          } else if (parsed && typeof parsed.user_id === "number") {
            userId = parsed.user_id;
          }
        } catch {
          // ignore parse error
        }
      }

      if (!userId) {
        showToast("error", "User information not found.");
        setIsSubmitting(false);
        return;
      }

      // Current date in YYYY-MM-DD
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10);

      // 1️⃣ First POST: /api/spareparts-requests
      const mainResp = await fetch(`${BASE_URL}/api/spareparts-requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,                 // from auth_response
          sparepartsId,           // selected Spare Part Type ID
          branchId,               // branch from search result
          date: dateStr,          // current date
          vinNumber: vin,         // from VIN field
          requestStatus: "pending",
        }),
      });

      if (!mainResp.ok) {
        throw new Error("Failed to create spare parts request.");
      }

      const mainData = await mainResp.json();
      console.log(mainData);
      const spareRequestId = mainData.sparepartsrequestId;

      if (!spareRequestId) {
        throw new Error("Request ID not returned from server.");
      }

      // 2️⃣ Second POST (loop): /api/spare-parts/request-details
      for (const p of parts) {
        await fetch(`${BASE_URL}/api/spare-parts/request-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sparepartsrequest_id: spareRequestId,
            spare_part: p.name,
            class_type: "",
            qty: p.qty,
            price: "0.0",
          }),
        });
      }

      // 3️⃣ Toast on success
      showToast("success", "Request is submitted successfully");
      setModalOpen(false);
    } catch (error) {
      showToast("error", "Failed to submit request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
          VIN{" "}
          <input
            value={vin}
            onChange={(e) => onVinChange(e.target.value)}
            placeholder="Enter VIN number"
            className="ml-1 border-b border-[#3F72AF] bg-transparent text-[#3F72AF] text-sm focus:outline-none"
          />
        </p>
      </div>

      <hr className="my-5 border-gray-200" />

      <div className="px-2">
        {/* Tab */}
        <button className="mb-6 px-5 py-2 bg-[#E9EEF5] rounded-lg text-sm border border-gray-200 text-[#4B5563] font-medium">
          {spareTypeLabel}
        </button>

        {/* Head row */}
        <div className="grid grid-cols-12 text-[14px] text-gray-600 font-semibold mb-2 px-1">
          <span className="col-span-7">Part name</span>
          <span className="col-span-3">Qty</span>
          <span className="col-span-2 text-center">Delete</span>
        </div>

        {/* Input rows */}
        {parts.map((item) => (
          <div key={item.id} className="grid grid-cols-12 gap-3 mb-3">
            <div className="col-span-7">
              <input
                value={item.name}
                onChange={(e) =>
                  handleChange(item.id, "name", e.target.value)
                }
                placeholder="Enter part name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
              />
              {errors[item.id]?.name && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[item.id]?.name}
                </p>
              )}
            </div>

            <div className="col-span-3">
              <input
                value={item.qty}
                onChange={(e) =>
                  handleChange(item.id, "qty", e.target.value)
                }
                placeholder="Enter qty"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
              />
              {errors[item.id]?.qty && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[item.id]?.qty}
                </p>
              )}
            </div>

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
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-[#3F72AF] hover:bg-[#2B5B8C] disabled:opacity-60 disabled:cursor-not-allowed text-white text-[16px] font-semibold py-4 rounded-xl shadow mt-8"
        >
          {isSubmitting ? "Submitting..." : "Submit Request"}
        </button>
      </div>
    </ModalBox>
  );
};
// ===================== POPUP COMPONENT (Make Reservation) END =====================


// ---------- Card ----------
function ResultCard({
  item,
  userLat,
  userLon,
  onRequest,
  selectedCity,
}: {
  item: SparePartResult & { distanceKm?: number };
  userLat: number;
  userLon: number;
  onRequest: (item: SparePartResult & { distanceKm?: number }) => void;
  selectedCity: string | undefined;
}) {
  const distanceKm = useMemo(() => {
    if (typeof item.distanceKm === 'number') return item.distanceKm;
    return haversineKm(userLat, userLon, item.latitude, item.longitude);
  }, [item.distanceKm, userLat, userLon, item.latitude, item.longitude]);

  // Build infos as in your template, but with dynamic City
  const infos = [
    { type: 'Spare part', data: item.spareparts_type },
    { type: 'State',      data: formatState(item.state) },
    { type: 'City',       data: selectedCity || '—' },
    { type: 'Distance',   data: `${distanceKm.toFixed(2)} km` },
  ];

  return (
    <div className={'flex gap-6 py-4 px-6 flex-col xl:flex-row rounded-[8px] bg-white'}>
      <div className={'basis-[50%] flex gap-4 items-center'}>
        <img className={'rounded-full size-14'} src={`${BASE_URL}/images/${item.logo_img}`}/>
        <div className={'flex flex-col gap-0.5'}>
          <h4 className={'text-charcoal text-xl font-semibold'}>{item.branch_name}</h4>
          <div className={'flex items-center gap-1'}>
            {(item.stars !== null && item.stars !== undefined) && (
              <img src={`/assets/icons/services/YellowStarIcon.svg`} width="17" />
            )}
            <h6 className={'text-charcoal text-sm font-semibold'}>{item.stars}</h6>
          </div>
        </div>
      </div>

      <div className={'flex flex-wrap gap-6 items-center basis-full xl:basis-[50%]'}>
        {infos.map((info) => (
          <div key={info.type} className={'w-[96px] flex flex-col'}>
            <h5 className={'text-muted-gray text-sm'}>{info.type}</h5>
            <h5 className={'text-black text-base font-medium'}>{info.data}</h5>
          </div>
        ))}
        <CustomBlueBtn
          text={'Make Reservation'}
          className={'h-[40px] bg-white font-semibold border-[1.5px] border-steel-blue text-steel-blue py-3 px-4'}
          onClick={() => onRequest(item)}
        />
      </div>
    </div>
  )
}

function SparePartsSearchResults() {
  const [rawResults, setRawResults] = useState<SparePartResult[]>([])
  const [userLoc, setUserLoc] = useState<{ lat: number; lon: number }>({ lat: 25.276987, lon: 55.296249 })
  const [sortOrder, setSortOrder] = useState<SortOrder>('all')
  const [selectedCity, setSelectedCity] = useState<string | undefined>(undefined)

  // Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [modalBranchId, setModalBranchId] = useState<number | null>(null);
  const [modalSparepartsId, setModalSparepartsId] = useState<number | null>(null);
  const [modalSpareTypeLabel, setModalSpareTypeLabel] = useState<string>('');
  const [modalVin, setModalVin] = useState<string>('');
  const [modalParts, setModalParts] = useState<PartRow[]>([]);

  // Load results, user location, and selected city written by selectors page
  useEffect(() => {
    try {
      const r = JSON.parse(sessionStorage.getItem('sp_search_results') || '[]');
      const loc = JSON.parse(sessionStorage.getItem('sp_user_location') || '{"lat":25.276987,"lon":55.296249}')
      setRawResults(Array.isArray(r) ? r : [])
      if (loc && typeof loc.lat === 'number' && typeof loc.lon === 'number') {
        setUserLoc({ lat: loc.lat, lon: loc.lon })
      }

      // ✅ read selected city name from payload saved by the selectors step
      const payload = JSON.parse(sessionStorage.getItem('sp_search_payload') || '{}')
      if (payload && typeof payload.city === 'string') {
        setSelectedCity(payload.city)
      }
    } catch {
      setRawResults([])
      setUserLoc({ lat: 25.276987, lon: 55.296249 })
      setSelectedCity(undefined)
    }
  }, [])

  // Distance decoration
  const resultsWithDistance = useMemo(() => {
    return rawResults.map(it => ({
      ...it,
      distanceKm: haversineKm(userLoc.lat, userLoc.lon, it.latitude, it.longitude),
    }))
  }, [rawResults, userLoc.lat, userLoc.lon])

  // Sort per ShopDistanceSelector
  const sortedResults = useMemo(() => {
    if (sortOrder === 'closest') {
      return [...resultsWithDistance].sort((a, b) => (a.distanceKm! - b.distanceKm!))
    }
    if (sortOrder === 'farthest') {
      return [...resultsWithDistance].sort((a, b) => (b.distanceKm! - a.distanceKm!))
    }
    return resultsWithDistance
  }, [resultsWithDistance, sortOrder])

  // 🔑 Make Reservation handler (called from card)
  const handleRequest = (item: SparePartResult & { distanceKm?: number }) => {
    // Read search payload (contains vin + spareparts_id from selectors)
    let payload: any = null;
    try {
      payload = JSON.parse(sessionStorage.getItem('sp_search_payload') || '{}');
    } catch {
      payload = null;
    }

    const vinFromPayload: string = payload?.vin?.toString()?.trim() || '';
    const spareId = payload?.spareparts_id
      ? Number(payload.spareparts_id)
      : NaN;

    const missingVin = !vinFromPayload;
    const missingService = !spareId || Number.isNaN(spareId);

    if (missingVin || missingService) {
      // Ask selectors component to run its validation & show messages under fields
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('sp-validate-selectors'));
      }
      showToast("error", "Please enter VIN number and select service before making a reservation.");
      return;
    }

    // Read spare parts rows (part name + quantity) stored by selectors
    let sparePartsRows: any[] = [];
    try {
      sparePartsRows = JSON.parse(sessionStorage.getItem('sp_spare_parts') || '[]');
    } catch {
      sparePartsRows = [];
    }

    let mappedParts: PartRow[];
    if (Array.isArray(sparePartsRows) && sparePartsRows.length > 0) {
      mappedParts = sparePartsRows.map((p, index) => ({
        id: p.id ?? index + 1,
        name: (p.name ?? '').toString(),
        qty: (p.quantity ?? p.qty ?? '').toString(),
      }));
    } else {
      // default 3 empty rows, for consistency with profile modal
      mappedParts = [
        { id: 1, name: "", qty: "" },
        { id: 2, name: "", qty: "" },
        { id: 3, name: "", qty: "" },
      ];
    }

    setModalBranchId(item.branch_id);
    setModalSparepartsId(spareId);
    setModalSpareTypeLabel(item.spareparts_type); // label comes from the clicked result (same as Select service text)
    setModalVin(vinFromPayload);
    setModalParts(mappedParts);
    setOpenModal(true);
  }

  return (
    <>
      <div className={'flex flex-col gap-y-5'}>
        <h5 className={'text-dark-gray text-sm font-medium'}>Search results</h5>

        <div className={'flex flex-col gap-3'}>
          <h5 className={'text-dark-gray text-sm font-medium'}>Filter by</h5>
          <div className={'max-w-full sm:max-w-[75%] xl:max-w-[50%] grid grid-cols-1 450:grid-cols-3 gap-3'}>
            {/* keep first two placeholders consistent with your template */}
            <ShopDistanceSelector
              placeholder="Shop distance"
              onChange={(v?: string) => setSortOrder((v as SortOrder) || 'all')}
            />
          </div>
        </div>

        <div className={'flex flex-col gap-y-4'}>
          {sortedResults.map((item, idx) => (
            <ResultCard
              key={`${item.branch_id}-${idx}`}
              item={item}
              userLat={userLoc.lat}
              userLon={userLoc.lon}
              onRequest={handleRequest}
              selectedCity={selectedCity}
            />
          ))}
          {sortedResults.length === 0 && (
            <div className="py-4 text-sm text-muted-gray">No results found.</div>
          )}
        </div>
      </div>

      {/* ===================== POPUP USAGE (Make Reservation) START ===================== */}
      {openModal && (
        <ViewEditModel
          openModal={openModal}
          setModalOpen={setOpenModal}
          sparepartsId={modalSparepartsId}
          branchId={modalBranchId}
          spareTypeLabel={modalSpareTypeLabel}
          vin={modalVin}
          onVinChange={setModalVin}
          showToast={showToast}
          initialParts={modalParts}
        />
      )}
      {/* ===================== POPUP USAGE (Make Reservation) END ===================== */}

      {/* Simple Toast */}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-[1100] rounded-md px-4 py-3 shadow-lg text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}

export default memo(SparePartsSearchResults)
