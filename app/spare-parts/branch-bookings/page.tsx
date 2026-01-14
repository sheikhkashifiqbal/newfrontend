"use client";
import { useEffect, useMemo, useState } from "react";
import NavTabs from "@/components/spareparts-nav-tabs";
import SparePartsTable from "@/components/spare-parts/spareparts-requests-table";

export type TabStatus = "Accepted offers" | "Accepted requests" | "Pending";

export type ApiSparePartItem = {
  id?: number;
  sparepartsrequest_id?: number;
  spare_part: string;
  class_type: string;
  qty: number;
  price: number;
};

export type ApiSparePartsResponse = {
  sparepartsrequest_id: number;
  date: string;
  branch_name: string;
  address: string;
  city: string;
  viN: string;
  spareparts_type: string;
  state: string;
  spare_part: ApiSparePartItem[];
  brand_id?: number; // ⚠ added: some records include brand_id
  brand_name?: string; // ⚠ added
  manager_mobile: string;
  id: number;
  request_status: string;
};

export type SparePartRequestUI = {
  id: number;
  sparepartsrequest_id: number;
  date: string;
  serviceLocation: string;
  branchName: string;
  address: string;
  city: string;
  vinOrPlate: string;
  carPart: string;
  brandId?: number;
  brandName?: string;
  state: string;
  spareParts: ApiSparePartItem[];
  managerMobile: string;
  status: TabStatus;
};

const statusMap: Record<string, TabStatus> = {
  accepted_offer: "Accepted offers",
  accepted_offers: "Accepted offers",
  "accepted offer": "Accepted offers",
  "accepted offers": "Accepted offers",
  accepted_request: "Accepted requests",
  accepted_requests: "Accepted requests",
  "accepted request": "Accepted requests",
  "accepted requests": "Accepted requests",
  pending: "Pending",
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_URL = `${BASE_URL}/api/spare-parts/offers/store-branch`;

const tabItems = [
  {
    label: "My bookings",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    label: "Spare part request",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M7 7H17V17H7V7Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M3 3L21 21" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Profile info",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

type BranchOption = {
  branch_id: number;
  branch_name: string;
};

export default function SparePartsRequestPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>("Accepted offers");
  const [selectedPart, setSelectedPart] = useState<string>("All");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  const [sparePartRequests, setSparePartRequests] = useState<SparePartRequestUI[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);

  // NEW: hold branch list from auth_response for dropdown
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);

  // ✅ UPDATED: get branch_id from localStorage 'branch_id' first, then fallback to auth_response
  useEffect(() => {
    try {
      // 1) Try to read from localStorage key 'branch_id'
      const storedBranchIdRaw = localStorage.getItem("branch_id");
      let branchFromStorage: number | null = null;

      if (storedBranchIdRaw) {
        const parsedNum = Number(storedBranchIdRaw);
        if (!Number.isNaN(parsedNum)) {
          branchFromStorage = parsedNum;
        }
      }

      // 2) Read auth_response (for branch_list + fallback branch_id)
      const authRaw = localStorage.getItem("auth_response");
      let parsedAuth: any = null;

      if (authRaw) {
        parsedAuth = JSON.parse(authRaw);

        // If there is a branch_list in auth_response, store it for dropdown
        if (Array.isArray(parsedAuth?.branch_list)) {
          const list: BranchOption[] = parsedAuth.branch_list
            .filter(
              (b: any) =>
                b &&
                (typeof b.branch_id === "number" ||
                  (typeof b.branch_id === "string" && b.branch_id !== ""))
            )
            .map((b: any) => ({
              branch_id:
                typeof b.branch_id === "number"
                  ? b.branch_id
                  : Number(b.branch_id),
              branch_name: String(b.branch_name ?? ""),
            }))
            .filter((b: BranchOption) => !Number.isNaN(b.branch_id));

          setBranchOptions(list);
        }
      }

      // 3) Decide final branch_id: localStorage 'branch_id' first, else auth_response.branch_id
      let branchFromAuth: number | null = null;
      if (parsedAuth && parsedAuth.branch_id != null) {
        if (typeof parsedAuth.branch_id === "number") {
          branchFromAuth = parsedAuth.branch_id;
        } else {
          const parsedNum = Number(parsedAuth.branch_id);
          if (!Number.isNaN(parsedNum)) {
            branchFromAuth = parsedNum;
          }
        }
      }

      const finalBranchId = branchFromStorage ?? branchFromAuth;

      if (finalBranchId != null) {
        setBranchId(finalBranchId);

        // Store in required key 'branch_id'
        localStorage.setItem("branch_id", String(finalBranchId));

        // Keep existing compatibility key if it was used before
        localStorage.setItem("branchId", String(finalBranchId));
      } else {
        // If no branch id anywhere, redirect to home
        window.location.href = "/";
      }
    } catch {
      window.location.href = "/";
    }
  }, []);

  // ⬇ Fetch using branch_id instead of user_id
  useEffect(() => {
    if (branchId == null) return;

    (async () => {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId }),
          //  credentials: "include",
        });

        const json: ApiSparePartsResponse[] = await res.json();

        const mapped: SparePartRequestUI[] = json.map((item) => ({
          id: item.id,
          sparepartsrequest_id: item.sparepartsrequest_id,
          date: item.date,
          branchName: item.branch_name,
          address: item.address,
          city: item.city,
          serviceLocation: `${item.branch_name}, ${item.address}, ${item.city}`,
          vinOrPlate: item.viN,
          carPart: item.spareparts_type,
          brandId: item.brand_id,
          brandName: item.brand_name,
          state: item.state,
          spareParts: (item.spare_part || []).map((d) => ({
            id: d.id,
            sparepartsrequest_id: d.sparepartsrequest_id ?? item.sparepartsrequest_id,
            spare_part: d.spare_part,
            class_type: d.class_type,
            qty: d.qty,
            price: d.price,
          })),
          managerMobile: item.manager_mobile,
          status: statusMap[(item.request_status || "").toLowerCase()] || "Pending",
        }));

        setSparePartRequests(mapped);
      } catch (e) {
        console.error("Request failed:", e);
        setSparePartRequests([]);
      }
    })();
  }, [branchId]);

  // Filters
  const uniqueBrands = useMemo(() => {
    const setx = new Set<string>();
    sparePartRequests.forEach((r) => r.brandName && setx.add(r.brandName));
    return ["All", ...Array.from(setx)];
  }, [sparePartRequests]);

  const uniqueParts = useMemo(() => {
    const setx = new Set<string>();
    sparePartRequests.forEach((r) => r.carPart && setx.add(r.carPart));
    return ["All", ...Array.from(setx)];
  }, [sparePartRequests]);

  const filteredRequests = useMemo(() => {
    return sparePartRequests.filter((r) => {
      const matchesTab = r.status === activeTab;
      const matchesPart = selectedPart === "All" || r.carPart === selectedPart;
      const matchesBrand = selectedBrand === "All" || r.brandName === selectedBrand;
      return matchesTab && matchesPart && matchesBrand;
    });
  }, [sparePartRequests, activeTab, selectedPart, selectedBrand]);

  const tabCounts = useMemo(() => {
    const countFor = (tab: TabStatus) =>
      sparePartRequests.filter((r) => {
        const mTab = r.status === tab;
        const mBrand = selectedBrand === "All" || r.brandName === selectedBrand;
        const mPart = selectedPart === "All" || r.carPart === selectedPart;
        return mTab && mBrand && mPart;
      }).length;

    return {
      "Accepted offers": countFor("Accepted offers"),
      "Accepted requests": countFor("Accepted requests"),
      Pending: countFor("Pending"),
    };
  }, [selectedBrand, selectedPart, sparePartRequests]);

  const handleLocalStatusChange = (sparepartsrequestId: number, nextStatus: string) => {
    setSparePartRequests((prev) =>
      prev.map((r) =>
        r.sparepartsrequest_id === sparepartsrequestId
          ? { ...r, status: statusMap[(nextStatus || "").toLowerCase()] || r.status }
          : r
      )
    );
  };

  // 🔹 UI labels for tabs (logic still uses original TabStatus strings)
  const tabLabelMap: Record<TabStatus, string> = {
    Pending: "Spare part requests",
    "Accepted offers": "Accepted offers",
    "Accepted requests": "Sent offers",
  };

  // 🔹 handle top nav tab redirects
  const handleTopTabsChange = (label: string) => {
    if (label === "Profile info") {
      window.location.href = "/profile/manager";
      return;
    }
    if (label === "Spare part request") {
      window.location.href = "/spare-parts/branch-bookings";
      return;
    }
    if (label === "My bookings") {
      window.location.href = "/services/branch-bookings";
      return;
    }
  };

  if (branchId == null) return null;

  return (
    <div className="bg-gray-50 pb-20">
      <section className="max-w-[1120px] mx-auto px-4 py-8">
        <NavTabs
          tabItems={tabItems}
          defaultActiveTab="Spare part request"
          onChange={handleTopTabsChange}
        />
      </section>

      <section className="max-w-[1120px] mx-auto px-4 mb-8">
        <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">
          Spare part requests
        </h2>
        <p className="text-[#ADB5BD] text-xl md:text[20px] mt-2">
          See your request from users.
        </p>

        {/* ✅ NEW: Select Branch dropdown (from auth_response.branch_list) */}
        {branchOptions.length > 0 && (
          <div className="mt-6">
            <label className="block text-sm text-[#495057] mb-2">Select Branch</label>
            <div className="relative inline-block">
              <select
                className="appearance-none bg-[#E9ECEF] min-w-[240px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                value={branchId ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const numeric = Number(val);
                  if (Number.isNaN(numeric)) return;

                  setBranchId(numeric);
                  localStorage.setItem("branch_id", String(numeric));
                  localStorage.setItem("branchId", String(numeric));
                }}
              >
                <option value="">Select Branch</option>
                {branchOptions.map((b) => (
                  <option key={b.branch_id} value={b.branch_id}>
                    {b.branch_name}
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
        )}

        <div>
          <label className="block mt-6 text-sm text-[#495057]">Filters</label>
          <div className="mt-3 flex gap-3 flex-wrap">
            <div className="relative">
              <select
                className="appearance-none bg-[#E9ECEF] min-w-[200px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
              >
                {uniqueBrands.map((b) => (
                  <option key={b} value={b}>
                    {b === "All" ? "Brand (All)" : b}
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
                value={selectedPart}
                onChange={(e) => setSelectedPart(e.target.value)}
              >
                {uniqueParts.map((part) => (
                  <option key={part} value={part}>
                    {part}
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
      </section>

      {/* Tabs Section */}
      <section className="border-b border-gray-200 mb-8">
        <div className="flex gap-3 sm:gap-10 max-w-[1120px] mx-auto px-4">
          {(["Pending", "Accepted offers", "Accepted requests"] as TabStatus[]).map((tab) => {
            const isActive = activeTab === tab;
            const borderColor =
              tab === "Accepted offers"
                ? "border-blue-400"
                : tab === "Accepted requests"
                ? "border-green-400"
                : "border-yellow-400";
            return (
              <button
                key={tab}
                className={`px-0 py-4 font-medium flex gap-1 sm:gap-3 items-center ${
                  isActive
                    ? `text-gray-700 border-b-2 ${borderColor}`
                    : "text-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <img
                  src={
                    tab === "Accepted offers"
                      ? "/icons/clock-fast-forward.svg"
                      : tab === "Accepted requests"
                      ? "/icons/check-circle-broken.svg"
                      : "/icons/clock-refresh.svg"
                  }
                  width={24}
                  alt={`${tab} icon`}
                />
                <p>{tabLabelMap[tab]}</p>
                <span className="px-3 py-[2px] border border-[#E9ECEF] rounded-3xl">
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <SparePartsTable
        services={filteredRequests}
        activeTab={activeTab}
        onStatusChange={handleLocalStatusChange}
      />
    </div>
  );
}
