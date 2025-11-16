"use client";
import ModalBox from "@/components/model-box";
import React, { useEffect, useMemo, useState } from "react";
import { MakeAReservation } from "./MakeAReservation";
import CompanyReviews from "./company-review";
import { useSearchParams } from "next/navigation";

const tabs = [
  { label: "Company Services", icon: "/icons/tool-02.svg" },
  { label: "Company Reviews", icon: "/icons/star.svg" },
];

type BrandOption = { brand_id: number; brand_name: string };
type ServiceOption = { service_id: number; service_name: string };
type GlobalServiceOption = { serviceId: number; serviceName: string };

type BranchServiceRow = {
  brand_name: string;
  brand_icon: string;
  status: string;
  available_services: { id: number; service_name: string; status: string }[];
};

const dayIndex: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};
const indexDay = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function mode<T>(arr: T[], key?: (x: T) => any): any {
  const counts = new Map<any, number>();
  for (const item of arr) {
    const k = key ? key(item) : item;
    counts.set(k, (counts.get(k) || 0) + 1);
  }
  let best: any = undefined;
  let bestN = -1;
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k;
      bestN = n;
    }
  }
  return best;
}

const PerformanceCenterPage = () => {
  const [activeTab, setActiveTab] = useState<any>("Company Services");
  const [openModal, setOpenModal] = useState<any>(false);
  const params = useSearchParams();
  const branchId = Number(params?.get("branchId") || 1);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Filters
  const [brandOptions, setBrandOptions] = useState<BrandOption[]>([]);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>([]);
  const [globalServiceOptions, setGlobalServiceOptions] = useState<GlobalServiceOption[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | "">("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");

  // Services Grid
  const [grid, setGrid] = useState<BranchServiceRow[]>([]);
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);

  // Branch info
  const [addressText, setAddressText] = useState<string>("Branch Address");
  const [mapUrl, setMapUrl] = useState<string>("#");
  const [hoursToday, setHoursToday] = useState<string>("Saturday: 10:00–16:00");
  const [hoursRange, setHoursRange] = useState<string>("Monday–Friday: 09:00–18:00");
  const [managerPhone, setManagerPhone] = useState<string>("+99450 289–09–85");
  const [managerMobile, setManagerMobile] = useState<string>("+99450 289–09–80");

  // ---- API: Brands ----
  useEffect(() => {
    let alive = true;
    async function loadBrands() {
      try {
        if (!branchId || activeTab !== "Company Services") return;
        const res = await fetch(`${BASE_URL}/api/branch-catalog/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId }),
        });
        if (!res.ok) throw new Error("Failed to load brands");
        const json = await res.json();
        const brands: BrandOption[] = json?.brands ?? [];
        if (alive) setBrandOptions(brands);
      } catch {
        if (alive) setBrandOptions([]);
      }
    }
    loadBrands();
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId, activeTab]);

  // ---- API: Services (dependent on brand) ----
  useEffect(() => {
    let alive = true;
    async function loadServices() {
      try {
        if (!branchId || activeTab !== "Company Services" || !selectedBrandId) {
          setServiceOptions([]);
          return;
        }
        const res = await fetch(`${BASE_URL}/api/branch-catalog/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId, brand_id: selectedBrandId }),
        });
        
        if (!res.ok) throw new Error("Failed to load services");
        const json = await res.json();
        console.log("JSONN", json);
        const services: ServiceOption[] = json?.services ?? [];
        if (alive)
        {
            setServiceOptions(services);
            //setGlobalServiceOptions(services);
        }
      } catch {
        if (alive) setServiceOptions([]);
      }
    }
    loadServices();
    setSelectedServiceId("");
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId, selectedBrandId, activeTab]);

  // ---- ✅ NEW: Global Services on Page Load ----
  useEffect(() => {
    async function loadGlobalServices() {
      try {
        const res = await fetch(`${BASE_URL}/api/services`);
        if (!res.ok) throw new Error("Failed to load global services");
        const json = await res.json();
        const data: GlobalServiceOption[] = Array.isArray(json) ? json : [];
        setGlobalServiceOptions(data);
      } catch {
        setGlobalServiceOptions([]);
      }
    }
    loadGlobalServices();
  }, [BASE_URL]);

  // ---- API: Services Grid ----
  useEffect(() => {
    let alive = true;
    async function loadGrid() {
      try {
        if (!branchId || activeTab !== "Company Services") return;
        setLoadingGrid(true);
        const payload: any = { branch_id: branchId };
        if (selectedBrandId) payload.brand_id = selectedBrandId;
        if (selectedServiceId) payload.service_id = selectedServiceId;

        const res = await fetch(`${BASE_URL}/api/branch-services/by-branch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed to load branch services grid");
        const json: BranchServiceRow[] = await res.json();
        if (alive) setGrid(Array.isArray(json) ? json : []);
      } catch {
        if (alive) setGrid([]);
      } finally {
        if (alive) setLoadingGrid(false);
      }
    }
    loadGrid();
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId, selectedBrandId, selectedServiceId, activeTab]);

  // ---- API: Work Days ----
  useEffect(() => {
    let alive = true;
    async function loadHours() {
      try {
        if (!branchId) return;
        const res = await fetch(`${BASE_URL}/api/work-days/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchId }),
        });
        if (!res.ok) throw new Error("Failed to load work days");
        const json = await res.json();

        if (!alive) return;

        const todayIdx = new Date().getDay();
        const todayName = indexDay[todayIdx];
        const todayRow = json.find(
          (row: any) => (row.workingDay || "").toLowerCase() === todayName.toLowerCase()
        );
        if (todayRow) {
          setHoursToday(`${todayName}: ${todayRow.from}–${todayRow.to}`);
        } else {
          setHoursToday("Closed today");
        }

        const days = json.map((r: any) => r.workingDay.toLowerCase()).filter((x: string) => x in dayIndex);
        if (days.length) {
          const indices = days.map((d: string) => dayIndex[d]).sort((a: number, b: number) => a - b);
          const start = indexDay[indices[0]];
          const end = indexDay[indices[indices.length - 1]];
          const fromMode = mode(json, (r: any) => r.from) || "09:00";
          const toMode = mode(json, (r: any) => r.to) || "18:00";
          setHoursRange(`${start}–${end}: ${fromMode}–${toMode}`);
        }
      } catch {
        setHoursToday("Saturday: 10:00–16:00");
        setHoursRange("Monday–Friday: 09:00–18:00");
      }
    }
    loadHours();
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId]);

  // ---- API: Branch Address / Map + Company ----
  useEffect(() => {
    let alive = true;
    async function loadBranch() {
      try {
        if (!branchId) return;
        const res = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error("Failed to load branch");
        const branchJson = await res.json();

        if (!alive) return;
        const city = branchJson?.city ? String(branchJson.city) : "";
        const address = branchJson?.address ? String(branchJson.address) : "";
        const composed = [address, city].filter(Boolean).join(", ");
        setAddressText(composed || "Branch Address");
        setMapUrl(branchJson?.branchAddress || "#");

        // ✅ NEW: Call company details API
        if (branchJson?.companyId) {
          const companyRes = await fetch(`${BASE_URL}/api/companies/${branchJson.companyId}`);
          if (companyRes.ok) {
            const companyJson = await companyRes.json();
            setManagerPhone(companyJson?.managerPhone || "+99450 289–09–85");
            setManagerMobile(companyJson?.managerMobile || "+99450 289–09–80");
          }
        }
      } catch {
        setAddressText("Branch Address");
        setMapUrl("#");
      }
    }
    loadBranch();
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId]);

  return (
    <>
      <div className="bg-[#F8F9FA] min-h-screen">
        {/* Back Button */}
        <div className="max-w-[1224px] mx-auto px-4 pt-6">
            <button
                onClick={() => (window.location.href = "/services")}
                className="flex items-center gap-2 text-[#3F72AF] font-medium hover:text-[#265d97] transition-colors"
            >
                <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
                >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                />
                </svg>
                Back to Services
            </button>
        </div>

        {/* Header */}
        <div className="flex justify-center py-8 px-2 max-w-[1224px] mx-auto">
          <div className="relative w-full">
            <img
              src="/images/single-service.png"
              alt=""
              className="h-[280px] w-full rounded-[24px] object-cover"
            />
            <div className="bg-gradient-to-r from-[#02020272] to-[#24242414] absolute inset-0 rounded-[24px] p-6 sm:p-10 text-white">
              <ul className="flex items-center gap-2 text-sm text-gray-300">
                <li>Home</li>
                <li>&gt;</li>
                <li>Services</li>
                <li>&gt;</li>
                <li className="text-white">Performance Center</li>
              </ul>
              <div className="mt-6 flex items-center gap-3">
                <img
                  src="/images/s-logo.png"
                  alt="Logo"
                  className="h-[42px] md:h-[72px] rounded-[24px] object-cover"
                />
                <div>
                  <p className="text-2xl md:text-[32px] font-semibold">Performance Center</p>
                  <p className="text-sm">⭐</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <section className="max-w-[1120px] mx-auto px-4 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p>📍 {addressText}</p>
            <a href={mapUrl} target="_blank" rel="noreferrer" className="text-blue-500 underline">
              Google Map
            </a>
          </div>
          <div>
            <p>🕒 {hoursRange}</p>
            <p>{hoursToday}</p>
          </div>
          <div>
            <p>📞 {managerPhone}</p>
            <p>📞 {managerMobile}</p>
          </div>
        </section>

        {/* Tabs */}
        <div className=" mb-6 border-b border-gray-200">
          <div className="flex gap-6 max-w-[1120px] mx-auto px-4">
            {tabs.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 ${
                  activeTab === label
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <img src={icon} alt={`${label} icon`} className="w-5 h-5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab */}
        <div className="max-w-[1120px] mx-auto px-4">
          {activeTab === "Company Services" ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                  <p className="mb-2">Filter by</p>
                  <div className="flex gap-2">
                    {/* Brand Selector */}
                    <div className="relative">
                      <select
                        className="appearance-none bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                        value={selectedBrandId}
                        onChange={(e) =>
                          setSelectedBrandId(e.target.value ? Number(e.target.value) : "")
                        }
                      >
                        <option value="">Car brand</option>
                        {brandOptions.map((b) => (
                          <option key={b.brand_id} value={b.brand_id}>
                            {b.brand_name}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* ✅ Global Services Selector */}
{/* ✅ Services Selector (shows brand-specific when brand selected, otherwise global) */}
<div className="relative">
  <select
    className="appearance-none bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
    value={selectedServiceId}
    onChange={(e) =>
      setSelectedServiceId(e.target.value ? Number(e.target.value) : "")
    }
  >
    <option value="">Service</option>
    {(selectedBrandId ? serviceOptions : globalServiceOptions).map((s: any) => (
      <option
        key={selectedBrandId ? s.service_id : s.serviceId}
        value={selectedBrandId ? s.service_id : s.serviceId}
      >
        {selectedBrandId ? s.service_name : s.serviceName}
      </option>
    ))}
  </select>
  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
    <svg
      className="w-4 h-4 text-gray-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  </div>
</div>

                  </div>
                </div>
                <button
                  onClick={() => setOpenModal(true)}
                  className="bg-[#3F72AF] hover:bg-[#2753c3] text-white px-6 py-2 rounded-md text-sm"
                >
                  Make Reservation
                </button>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                {loadingGrid ? (
                  <div className="col-span-full py-8 text-center text-gray-500">Loading services…</div>
                ) : grid.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-gray-500">No services found.</div>
                ) : (
                  grid.map((row, idx) => {
                    const logo = `${BASE_URL}/images/${row.brand_icon}`;
                    return (
                      <div key={idx} className="rounded-2xl bg-white p-6 relative">
                        <div className="flex items-center gap-2 mb-4">
                          <img
                            src={logo}
                            alt={row.brand_name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                          <p className="font-medium">{row.brand_name}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(row.available_services || []).map((s) => (
                            <span
                              key={s.id}
                              className="inline-flex items-center rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-gray-700"
                            >
                              {s.service_name}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <CompanyReviews branchId={branchId} />
          )}
        </div>
      </div>

      <ModalBox
        open={openModal}
        onOpenChange={() => setOpenModal(null)}
        title="Make the reservation"
        maxWidth="808px"
        bg="bg-gray-50"
      >
        <MakeAReservation />
      </ModalBox>
    </>
  );
};

export default PerformanceCenterPage;
