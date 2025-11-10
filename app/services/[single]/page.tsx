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

type BranchServiceRow = {
  brand_name: string;
  brand_icon: string; // icon.jpg
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
  const [selectedBrandId, setSelectedBrandId] = useState<number | "">("");
  const [selectedServiceId, setSelectedServiceId] = useState<number | "">("");

  // Services Grid
  const [grid, setGrid] = useState<BranchServiceRow[]>([]);
  const [loadingGrid, setLoadingGrid] = useState<boolean>(false);

  // Branch info (address & hours)
  const [addressText, setAddressText] = useState<string>("Branch Address");
  const [mapUrl, setMapUrl] = useState<string>("#");
  const [hoursToday, setHoursToday] = useState<string>("Saturday: 10:00–16:00");
  const [hoursRange, setHoursRange] = useState<string>("Monday–Friday: 09:00–18:00");

  // ---- API: Brands (on load of Company Services) ----
  useEffect(() => {
    let alive = true;
    async function loadBrands() {
        console.log("branch_id", branchId);
        console.log("branch_id", branchId);

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

  // ---- API: Services (when brand changes) ----
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
        const services: ServiceOption[] = json?.services ?? [];
        if (alive) setServiceOptions(services);
      } catch {
        if (alive) setServiceOptions([]);
      }
    }
    loadServices();
    // clear service selection if brand changes
    setSelectedServiceId("");
    return () => {
      alive = false;
    };
  }, [BASE_URL, branchId, selectedBrandId, activeTab]);

  // ---- API: Services Grid (when filters change) ----
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

  // ---- API: Work Days (opening hours) ----
  useEffect(() => {
    let alive = true;
    async function loadHours() {
      try {
        if (!branchId) return;
        const res = await fetch(`${BASE_URL}/api/work-days/search`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchId: branchId }),
        });
        if (!res.ok) throw new Error("Failed to load work days");
        const json: { workId: number; branchId: number; workingDay: string; from: string; to: string; status: string }[] =
          await res.json();

        if (!alive) return;

        const todayIdx = new Date().getDay(); // 0 Sun ... 6 Sat
        const todayName = indexDay[todayIdx]; // e.g., "Sunday"
        const todayRow = (json || []).find(
          (row) => (row.workingDay || "").toLowerCase() === todayName.toLowerCase()
        );
        if (todayRow) {
          setHoursToday(
            `${todayName}: ${todayRow.from || "00:00"}–${todayRow.to || "00:00"}`
          );
        } else {
          setHoursToday("Closed today");
        }

        // Range: determine min and max working day present
        const days = (json || []).map((r) => (r.workingDay || "").toLowerCase()).filter((x) => x in dayIndex);
        if (days.length) {
          const indices = days.map((d) => dayIndex[d]).sort((a, b) => a - b);
          const start = indexDay[indices[0]];
          const end = indexDay[indices[indices.length - 1]];

          // Mode of from/to
          const fromMode = mode(json || [], (r) => r.from) || "09:00";
          const toMode = mode(json || [], (r) => r.to) || "18:00";
          setHoursRange(`${start}–${end}: ${fromMode}–${toMode}`);
        } else {
          setHoursRange("Monday–Friday: 09:00–18:00");
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

  // ---- API: Branch Address / Map ----
  useEffect(() => {
    let alive = true;
    async function loadBranch() {
      try {
        console.log("branchID:::",branchId);
        if (!branchId) return;
        const res = await fetch(`${BASE_URL}/api/branches/${branchId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
         // body: JSON.stringify({ branch_id: branchId }),
        });
        if (!res.ok) throw new Error("Failed to load branch");
        const json = await res.json();
        console.log("JSON::", json);
        if (!alive) return;
        const city = json?.city ? String(json.city) : "";
        const address = json?.address ? String(json.address) : "";
        const composed = [address, city].filter(Boolean).join(", ");
        
        setAddressText(composed || "Branch Address");
        setMapUrl(json?.branchAddress || "#");
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
                  {/* Optional overall stars text — you can wire this to your own field if needed */}
                  <p className="text-sm">⭐</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <section className="max-w-[1120px] mx-auto px-4 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p>📍 {addressText || "Branch Address"}</p>
            <a href={mapUrl || "#"} target="_blank" rel="noreferrer" className="text-blue-500 underline">
              Google Map
            </a>
          </div>
          <div>
            <p>🕒 {hoursRange}</p>
            <p>{hoursToday}</p>
          </div>
          <div>
            <p>📞 +99450 289–09–85</p>
            <p>📞 +99450 289–09–80</p>
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

        {/* Active Tab Content */}
        <div className="max-w-[1120px] mx-auto px-4">
          {activeTab === "Company Services" ? (
            <>
              {/* Filters + Button */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="">
                  <p className="mb-2">Filter by</p>
                  <div className="flex gap-2">
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

                    <div className="relative">
                      <select
                        className="appearance-none bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                        value={selectedServiceId}
                        onChange={(e) =>
                          setSelectedServiceId(e.target.value ? Number(e.target.value) : "")
                        }
                        disabled={!selectedBrandId}
                      >
                        <option value="">Service</option>
                        {serviceOptions.map((s) => (
                          <option key={s.service_id} value={s.service_id}>
                            {s.service_name}
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
