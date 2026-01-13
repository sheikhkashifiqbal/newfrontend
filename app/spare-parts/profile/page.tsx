"use client";
import React, { useEffect, useMemo, useState } from "react";
import ModalBox from "@/components/spareparts-model-box";
import CompanyReviews from "./company-review";
import { MakeAReservation } from "./MakeAReservation";
import { useSearchParams } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const tabs = [
  { label: "Company Spare Parts", icon: "/icons/tool-02.svg" },
  { label: "Company Reviews", icon: "/icons/star.svg" },
];

/* ===================== POPUP COMPONENT (View / Edit) START ===================== */
const ViewEditModel = ({
  openModal,
  setModalOpen,
  sparepartsId,
  branchId,
  spareTypeLabel,
  vin,
  onVinChange,
  showToast,
}: any) => {
  const [parts, setParts] = useState([
    { id: 1, name: "", qty: "" },
    { id: 2, name: "", qty: "" },
    { id: 3, name: "", qty: "" },
  ]);

  const [errors, setErrors] = useState<{
    [key: number]: { name?: string; qty?: string };
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = () => {
    setParts([...parts, { id: Date.now(), name: "", qty: "" }]);
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
    setParts(parts.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
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
          userId, // from auth_response
          sparepartsId, // selected Spare Part Type ID
          branchId, // from query string
          date: dateStr, // current date
          vinNumber: vin, // from VIN field
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
    <ModalBox open={openModal} onOpenChange={setModalOpen} title="" maxWidth="627px" bg="bg-gray-50">
      {/* Header */}
      <div className="pb-2">
        <h2 className="text-[24px] text-gray-900 font-semibold -mt-5">Required spare parts</h2>

        <p className="mt-1 text-gray-600 text-[15px] leading-tight">
          <span className="text-[#3F72AF] underline cursor-pointer"></span>{" "}
          VIN{" "}
          {/* VIN FIELD (replacing static text 27393A7GDB67WOP921) */}
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
                onChange={(e) => handleChange(item.id, "name", e.target.value)}
                placeholder="Enter part name"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
              />
              {errors[item.id]?.name && <p className="mt-1 text-xs text-red-500">{errors[item.id]?.name}</p>}
            </div>

            <div className="col-span-3">
              <input
                value={item.qty}
                onChange={(e) => handleChange(item.id, "qty", e.target.value)}
                placeholder="Enter qty"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 text-sm focus:ring-[#3F72AF]"
              />
              {errors[item.id]?.qty && <p className="mt-1 text-xs text-red-500">{errors[item.id]?.qty}</p>}
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
/* ===================== POPUP COMPONENT (View / Edit) END ===================== */

export default function SparePartsProfile() {
  const [activeTab, setActiveTab] = useState("Company Spare Parts");
  const [openModal, setOpenModal] = useState(false);
  const searchParams = useSearchParams();
  const branchId = useMemo(() => Number(searchParams.get("branchId")), [searchParams]);

  const [carBrands, setCarBrands] = useState<{ brand_id: number; brand_name: string; status: string }[]>([]);
  const [services, setServices] = useState<{ spareparts_id: number; spareparts_type: string }[]>([]);
  const [grid, setGrid] = useState<any[]>([]);
  const [selBrand, setSelBrand] = useState<number | "">("");
  const [selService, setSelService] = useState<number | "">("");
  const [topAddress, setTopAddress] = useState<any>({});
  const [todayText, setTodayText] = useState("Saturday: 10:00–16:00");
  const [weekdayText, setWeekdayText] = useState("Monday–Friday: 09:00–18:00");

  const [selBrandError, setSelBrandError] = useState<string>("");
  const [selServiceError, setSelServiceError] = useState<string>("");

  const [vin, setVin] = useState<string>("");

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // VIN from query string (if exists)
  useEffect(() => {
    const vinParam = searchParams.get("vin");
    if (vinParam && !vin) {
      setVin(vinParam);
    }
  }, [searchParams, vin]);

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

    fetch(`${BASE_URL}/api/SparePartBrandsList`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ branch_id: branchId }),
    })
      .then((res) => res.json())
      .then((json) => {
        // ✅ API returns array like:
        // [
        //   { status:"active", brand_id:1, brand_name:"Toyota" }
        // ]
        // so the dropdown options must use:
        // option value = brand_id, option text = brand_name
        const list = Array.isArray(json) ? json : json?.brands || [];
        setCarBrands(list);
      })
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
        const names = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const today = names[todayIdx];
        const todayObj = days.find((d: any) => d.workingDay?.toLowerCase() === today);
        if (todayObj) setTodayText(`${capitalize(todayObj.workingDay)}: ${todayObj.from}–${todayObj.to}`);

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

  const handleOpenModal = () => {
    let valid = true;

    if (!selBrand) {
      setSelBrandError("Please select car brand.");
      valid = false;
    } else {
      setSelBrandError("");
    }

    if (!selService) {
      setSelServiceError("Please select spare part type.");
      valid = false;
    } else {
      setSelServiceError("");
    }

    if (!valid) return;

    setOpenModal(true);
  };

  const selectedSpareTypeLabel = useMemo(() => {
    const found = services.find((s) => s.spareparts_id === selService);
    return found?.spareparts_type || "";
  }, [services, selService]);

  return (
    <>
      <div className="bg-[#F8F9FA] min-h-screen">
        {/* Top Banner */}
        <div className="flex justify-center py-8 px-2 max-w-[1224px] mx-auto">
          <div className="relative w-full">
            <img src="/images/single-service.png" alt="" className="h-[280px] w-full rounded-[24px] object-cover" />
          </div>
        </div>

        {/* Address and Hours */}
        <section className="max-w-[1120px] mx-auto px-4 text-sm text-gray-700 grid sm:grid-cols-3 gap-4 mb-6">
          <div>
            <p>
              📍 {topAddress.address}, {topAddress.city}
            </p>
            <a href={topAddress.map || "#"} target="_blank" className="text-blue-500 underline">
              Google Map
            </a>
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
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 ${
                  activeTab === label ? "border-blue-600 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                <img src={icon} alt={label} className="w-5 h-5" />
                {label}
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
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {/* ✅ Car Brand dropdown:
                          option value = brand_id
                          option text = brand_name */}
                      <select
                        className="bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px]"
                        value={selBrand}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelBrand(v ? Number(v) : "");
                          setSelService("");
                          setSelBrandError("");
                        }}
                      >
                        <option value="">Car brand</option>
                        {carBrands.map((b) => (
                          <option key={b.brand_id} value={b.brand_id}>
                            {b.brand_name}
                          </option>
                        ))}
                      </select>

                      <select
                        className="bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px]"
                        value={selService}
                        onChange={(e) => {
                          const v = e.target.value;
                          setSelService(v ? Number(v) : "");
                          setSelServiceError("");
                        }}
                      >
                        <option value="">Spare Part Type</option>
                        {services.map((s) => (
                          <option key={s.spareparts_id} value={s.spareparts_id}>
                            {s.spareparts_type}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Validation messages for selectors */}
                    <div className="flex gap-2">
                      <div className="min-w-[184px]">{selBrandError && <p className="text-xs text-red-500 mt-1">{selBrandError}</p>}</div>
                      <div className="min-w-[184px]">{selServiceError && <p className="text-xs text-red-500 mt-1">{selServiceError}</p>}</div>
                    </div>
                  </div>
                </div>

                {/* ===================== POPUP TRIGGER (Make Reservation) ===================== */}
                <button
                  onClick={handleOpenModal}
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
                        <img src={`${BASE_URL}/images/${b.brand_icon}`} alt={b.brand_name} className="h-6 w-6 rounded-full object-cover" />
                        <p className="font-medium">{b.brand_name}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {b.available_spareparts?.map((sp: any) => (
                          <span
                            key={`${sp.spareparts_id}-${sp.spareparts_type}`}
                            className="inline-flex items-center rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-gray-700"
                          >
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

      {/* ===================== POPUP USAGE (View / Edit) START ===================== */}
      {openModal && (
        <ViewEditModel
          openModal={openModal}
          setModalOpen={setOpenModal}
          sparepartsId={selService}
          branchId={branchId}
          spareTypeLabel={selectedSpareTypeLabel}
          vin={vin}
          onVinChange={setVin}
          showToast={showToast}
        />
      )}
      {/* ===================== POPUP USAGE (View / Edit) END ===================== */}

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
  );
}
