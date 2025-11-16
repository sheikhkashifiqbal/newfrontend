"use client";
import React, { useEffect, useMemo, useState } from "react";
import ModalBox from "@/components/model-box";
import CompanyReviews from "./company-review";
import { MakeAReservation } from "./MakeAReservation";
import { useSearchParams } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const tabs = [
  { label: "Company Spare Parts", icon: "/icons/tool-02.svg" },
  { label: "Company Reviews", icon: "/icons/star.svg" },
];

export default function SparePartsProfile() {
  const [activeTab, setActiveTab] = useState("Company Spare Parts");
  const [openModal, setOpenModal] = useState(false);
  const searchParams = useSearchParams();
  const branchId = useMemo(() => Number(searchParams.get("branchId")), [searchParams]);

  const [carBrands, setCarBrands] = useState<{ brand_id: number; brand_name: string }[]>([]);
  const [services, setServices] = useState<{ spareparts_id: number; spareparts_type: string }[]>([]);
  const [grid, setGrid] = useState<any[]>([]);
  const [selBrand, setSelBrand] = useState<number | "">("");
  const [selService, setSelService] = useState<number | "">("");
  const [topAddress, setTopAddress] = useState<any>({});
  const [todayText, setTodayText] = useState("Saturday: 10:00–16:00");
  const [weekdayText, setWeekdayText] = useState("Monday–Friday: 09:00–18:00");

  const dedupeSpareTypes = (arr: any[]) => {
    const seen = new Set<string>();
    return arr.filter((s) => {
      const t = s.spareparts_type.toLowerCase();
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });
  };

  // 4️⃣ Load spare-parts GET on page load
  useEffect(() => {
    fetch(`${BASE_URL}/api/spare-parts`)
      .then((res) => res.json())
      .then((json) => {
        const list = json.map((x: any) => ({
          spareparts_id: x.sparepartsId,
          spareparts_type: x.sparepartsType,
        }));
        setServices(dedupeSpareTypes(list));
      })
      .catch(() => {});
  }, []);

  // 1️⃣ a. Load brands
  useEffect(() => {
    if (!branchId || activeTab !== "Company Spare Parts") return;
    fetch(`${BASE_URL}/api/branch-catalog/brands`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch_id: branchId }),
    })
      .then((res) => res.json())
      .then((json) => setCarBrands(json.brands || []))
      .catch(() => {});
  }, [branchId, activeTab]);

  // 1️⃣ b. Load spareparts on brand change
  useEffect(() => {
    if (!branchId || !selBrand) return;
    fetch(`${BASE_URL}/api/branch-catalog/spareparts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch_id: branchId, brand_id: selBrand }),
    })
      .then((res) => res.json())
      .then((json) => setServices(dedupeSpareTypes(json.spareparts || [])))
      .catch(() => {});
  }, [branchId, selBrand]);

  // 1️⃣ c. Services Grid
  useEffect(() => {
    if (!branchId || activeTab !== "Company Spare Parts") return;
    const body: any = { branch_id: branchId };
    if (selBrand) body.brand_id = selBrand;
    if (selService) body.service_id = selService;

    fetch(`${BASE_URL}/api/prsp/branch-spareparts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.length) {
          setTopAddress({
            address: json[0].branch_address,
            city: json[0].city,
            map: json[0].location,
            manager_mobile: json[0].manager_mobile,
            manager_phone: json[0].manager_phone,

          });
        }
        setGrid(json || []);
      })
      .catch(() => {});
  }, [branchId, selBrand, selService, activeTab]);

  // 2️⃣ Workdays (open/close)
  useEffect(() => {
    if (!branchId) return;
    fetch(`${BASE_URL}/api/work-days/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branchId }),
    })
      .then((r) => r.json())
      .then((days) => {
        const todayIdx = new Date().getDay();
        const names = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
        const today = names[todayIdx];
        const todayObj = days.find((d: any) => d.workingDay?.toLowerCase() === today);
        if (todayObj)
          setTodayText(`${capitalize(todayObj.workingDay)}: ${todayObj.from}–${todayObj.to}`);

        const actives = days.filter((d: any) => d.status === "active");
        if (actives.length) {
          const idx = (n: string) => names.indexOf(n.toLowerCase());
          const sorted = actives.sort((a: any, b: any) => idx(a.workingDay) - idx(b.workingDay));
          const first = sorted[0].workingDay;
          const last = sorted[sorted.length - 1].workingDay;

          const mode = (arr: string[]) => {
            const count: any = {};
            arr.forEach((v) => (count[v] = (count[v] || 0) + 1));
            return Object.keys(count).reduce((a, b) => (count[a] > count[b] ? a : b));
          };
          const from = mode(actives.map((d: any) => d.from));
          const to = mode(actives.map((d: any) => d.to));
          setWeekdayText(`${capitalize(first)}–${capitalize(last)}: ${from}–${to}`);
        }
      })
      .catch(() => {});
  }, [branchId]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <>
      <div className="bg-[#F8F9FA] min-h-screen">
        {/* Top Banner */}
        <div className="flex justify-center py-8 px-2 max-w-[1224px] mx-auto">
          <div className="relative w-full">
            <img
              src="/images/single-service.png"
              alt=""
              className="h-[280px] w-full rounded-[24px] object-cover"
            />
          </div>
        </div>

        {/* Address and Hours */}
        <section className="max-w-[1120px] mx-auto px-4 text-sm text-gray-700 grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p>📍 {topAddress.address}, {topAddress.city}</p>
            <a href={topAddress.map || "#"} target="_blank" className="text-blue-500 underline">Google Map</a>
          </div>
          <div>
            <p>🕒 {weekdayText}</p>
            <p>{todayText}</p>
          </div>
          <div>
            <p>📞 {topAddress.manager_mobile}</p>
            <p>📞 {topAddress.manager_phone}</p>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex gap-6 max-w-[1120px] mx-auto px-4">
            {tabs.map(({ label, icon }) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 ${activeTab === label
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"}`}
              >
                <img src={icon} alt={label} className="w-5 h-5" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Active Tab */}
        <div className="max-w-[1120px] mx-auto px-4">
          {activeTab === "Company Spare Parts" ? (
            <>
              {/* Filters */}
              <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                  <p className="mb-2">Filter by</p>
                  <div className="flex gap-2">
                    <select
                      className="bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px]"
                      value={selBrand}
                      onChange={(e) => {
                        setSelBrand(Number(e.target.value));
                        setSelService("");
                      }}
                    >
                      <option value="">Car brand</option>
                      {carBrands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>{b.brand_name}</option>
                      ))}
                    </select>

                    <select
                      className="bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px]"
                      value={selService}
                      onChange={(e) => setSelService(Number(e.target.value))}
                    >
                      <option value="">Service</option>
                      {services.map((s) => (
                        <option key={s.spareparts_id} value={s.spareparts_id}>{s.spareparts_type}</option>
                      ))}
                    </select>
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
                {grid.flatMap((g, i) =>
                  g.brands?.map((b: any, j: number) => (
                    <div key={`${i}-${j}`} className="rounded-2xl bg-white p-6 relative">
                      <div className="flex items-center gap-2 mb-4">
                        <img
                          src={`${BASE_URL}/images/${b.brand_icon}`}
                          alt={b.brand_name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                        <p className="font-medium">{b.brand_name}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.available_spareparts?.map((sp: any) => (
                          <span key={`${sp.spareparts_id}-${sp.spareparts_type}`} className="inline-flex items-center rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-gray-700">
                            {sp.spareparts_type}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          ) : (
            <CompanyReviews branchId={branchId} />
          )}
        </div>
      </div>

      <ModalBox open={openModal} onOpenChange={setOpenModal} title="Make the reservation" maxWidth="808px" bg="bg-gray-50">
        <MakeAReservation />
      </ModalBox>
    </>
  );
}
