"use client"
import AccountDetails from "@/components/booking/AccountDetails";
import MyBranches from "@/components/booking/MyBranches";
import MyPlans from "@/components/booking/MyPlans";
import MyServices from "@/components/booking/MyServices";
import WorkSchedule from "@/components/booking/WorkSchedule";
// pages/ProfileInfoPage.tsx
import NavTabs from "@/components/nav-tabs";
import SecurityDetails from "@/components/profile/security-details";
import React, { useState } from "react";

type TabStatus = "Work schedule" | "My services" | "Account details" | "Security details" | "My Branches" | "My plans";

const ProfileInfoPage = () => {
    const [activeModule, setActiveModule] = useState<
        "Work schedule" | "My services" | "Account details" | "Security details" | "My Branches" | "My plans"
    >("Work schedule");
    const [activeTab, setActiveTab] = useState<TabStatus>("Work schedule");

    return (
        <div className="bg-[#F8F9FA] min-h-screen">
            <main className="max-w-[1120px] mx-auto px-4 py-8">
                <NavTabs tabItems={tabItems} defaultActiveTab="Profile info" />
            </main>

            {/* Section Title & Filters */}
            <section className="max-w-[1120px] mx-auto px-4 mb-8">
                <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">
                    Profile info
                </h2>
                <p className="text-[#ADB5BD] text-xl md:text-[20px] mt-2">
                    Everything about your profile
                </p>
            </section>


            {/* Tabs */}
            <section className="border-b border-gray-200 mb-8">
                <div className="flex gap-3 lg:justify-between lg:gap-12 max-w-[1120px] mx-auto px-4 flex-wrap">
                    {(["Work schedule", "My services", "Account details", "Security details", "My Branches", "My plans"]).map(
                        (tab:any) => {
                            const isActive = activeTab === tab;
                            return (
                                <button
                                    key={tab}
                                    className={`px-0 py-4 font-medium text-sm flex gap-1 sm:gap-3 items-center ${isActive
                                        ? `text-gray-700 border-b-2 border-gray-600`
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
                        }
                    )}
                </div>
            </section>

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
