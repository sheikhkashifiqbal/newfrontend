"use client";
import AccountDetails from "@/components/booking/AccountDetails";
import MyBranches from "@/components/booking/MyBranches";
import MyPlans from "@/components/booking/MyPlans";
import MyServices from "@/components/booking/MyServices";
import WorkSchedule from "@/components/booking/WorkSchedule";
import NavTabs from "@/components/nav-tabs";
import SecurityDetails from "@/components/profile/security-details";
import React, { useEffect, useState } from "react";

type TabStatus =
  | "Work schedule"
  | "My services"
  | "Account details"
  | "Security details"
  | "My Branches"
  | "My plans";

const ProfileInfoPage = () => {
  const [activeModule, setActiveModule] = useState<TabStatus>("Work schedule");
  const [activeTab, setActiveTab] = useState<TabStatus>("Work schedule");
  const [branchList, setBranchList] = useState<
    { branch_id: number; branch_name: string }[]
  >([]);
  const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

  // Load auth + branch once page loads
  useEffect(() => {
    try {
      const authRaw = localStorage.getItem("auth_response");
      if (!authRaw) {
        window.location.href = "/";
        return;
      }

      const parsed = JSON.parse(authRaw);
      const branches = parsed?.branch_list || [];
      const authBranchId = parsed?.branch_id;
      const storedSelectedBranch = localStorage.getItem("selected_branch");

      if (Array.isArray(branches)) {
        setBranchList(branches);
      }

      // Determine branch selection
      let currentBranchId: string | null = null;

      if (storedSelectedBranch) {
        currentBranchId = storedSelectedBranch;
      } else if (authBranchId) {
        currentBranchId = String(authBranchId);
        localStorage.setItem("branch_id", currentBranchId);
      } else {
        window.location.href = "/";
        return;
      }

      setSelectedBranch(Number(currentBranchId));
      localStorage.setItem("branch_id", currentBranchId);
    } catch (err) {
      console.error("Error reading auth_response:", err);
      window.location.href = "/";
    }
  }, []);

  // When user changes branch dropdown
  const handleBranchChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newBranchId = event.target.value;
    localStorage.setItem("selected_branch", newBranchId);
    localStorage.setItem("branch_id", newBranchId);
    window.location.reload(); // Full reload as required
  };

  if (selectedBranch === null) return null; // wait before rendering

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      {/* Main Top Navigation Tabs */}
      <main className="max-w-[1120px] mx-auto px-4 py-8">
        <NavTabs tabItems={tabItems} defaultActiveTab="Profile info" />
      </main>

      {/* Title Section */}
      <section className="max-w-[1120px] mx-auto px-4 mb-8">
        <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">
          Profile info
        </h2>
        <p className="text-[#ADB5BD] text-xl md:text-[20px] mt-2">
          Everything about your profile
        </p>

        {/* Branch Dropdown */}
        {branchList.length > 0 && (
          <div className="mt-4">
            <label
              htmlFor="branch-selector"
              className="block text-sm text-gray-600 mb-2 font-medium"
            >
              Select Branch
            </label>
            <select
              id="branch-selector"
              value={selectedBranch ?? ""}
              onChange={handleBranchChange}
              className="bg-white border border-gray-300 text-gray-700 rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {branchList.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </section>

      {/* Inner Profile Section Tabs */}
      <section className="border-b border-gray-200 mb-8">
        <div className="flex gap-3 lg:justify-between lg:gap-12 max-w-[1120px] mx-auto px-4 flex-wrap">
          {(
            [
              "Work schedule",
              "My services",
              "Account details",
              "Security details",
              "My Branches",
              "My plans",
            ] as TabStatus[]
          ).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                className={`px-0 py-4 font-medium text-sm flex gap-1 sm:gap-3 items-center ${
                  isActive
                    ? "text-gray-700 border-b-2 border-gray-600"
                    : "text-gray-300 hover:text-gray-700"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                <img
                  src={
                    tab === "Work schedule"
                      ? "/icons/calendar-check.svg"
                      : tab === "My services"
                      ? "/icons/tool-02.svg"
                      : tab === "Account details"
                      ? "/icons/user-edit.svg"
                      : tab === "Security details"
                      ? "/icons/shield-zap.svg"
                      : tab === "My Branches"
                      ? "/icons/building-02.svg"
                      : "/icons/file-plus-02.svg"
                  }
                  width={24}
                  alt={`${tab} icon`}
                />
                <p>{tab}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Module Content */}
      <section className="max-w-[1120px] mx-auto px-4">
        {activeTab === "Work schedule" && <WorkSchedule />}
        {activeTab === "My services" && <MyServices />}
        {activeTab === "Account details" && <AccountDetails />}
        {activeTab === "Security details" && <SecurityDetails />}
        {activeTab === "My Branches" && <MyBranches />}
        {activeTab === "My plans" && <MyPlans />}
      </section>
    </div>
  );
};

export default ProfileInfoPage;


// -------------------------
// TAB ITEMS WITH REDIRECT
// -------------------------
const tabItems = [
  {
    label: "My bookings",
    path: "/services/branch-bookings",
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
    path: "/spare-parts/branch-bookings",
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
    path: "/profile/manager",
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
