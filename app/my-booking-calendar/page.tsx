"use client";

import React, { useEffect, useMemo, useState } from "react";
import NavTabs from "@/components/nav-tabs";

const MyBooking: React.FC = () => {
  return (
    <>
      <div className="bg-gray-50 min-h-screen pb-20">
        {/* --------- TOP TABS ---------- */}
        <section className="max-w-[1120px] mx-auto px-4 pt-6">
          <NavTabs tabItems={tabItems} />
        </section>

        {/* -------- PAGE HEADER -------- */}
        <section className="max-w-[1120px] mx-auto px-4 mt-8 flex justify-between items-center">
          <div>
            <h2 className="text-[#3F72AF] text-[28px] md:text-[32px] font-semibold">
              My Bookings
            </h2>
            <p className="text-[#ADB5BD] text-[16px] md:text-[20px] mt-2">
              See your scheduled services from your calendar.
            </p>
          </div>

          {/* Switch to list view button */}
          <button className="flex items-center gap-2 bg-[#3f71af0b] rounded-lg shadow-sm px-4 py-3 hover:shadow-md transition-all">
            <svg width="18" height="18" fill="none" stroke="#3F72AF">
              <path
                d="M3 5H21M3 12H21M3 19H21"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-[#495057] font-medium text-sm">Switch to list view</span>
          </button>
        </section>

        {/* ---------- DATE SELECTOR ---------- */}
        <section className="max-w-[1120px] mx-auto px-4 mt-10">
          <div className="flex gap-6 overflow-x-auto scrollbar-none pb-4">

            {["20 Dec", "21 Dec", "22 Dec", "23 Dec", "24 Dec", "25 Dec", "26 Dec"].map((date, i) => (
              <div
                key={i}
                className={`min-w-[70px] text-center cursor-pointer rounded-xl border px-4 py-3 
              ${i === 0 ? "bg-white border-[#3F72AF] shadow-md text-[#3F72AF] font-semibold"
                    : "text-gray-400 border-gray-200"}`}
              >
                <span className="text-[18px]">{date.split(" ")[0]}</span>
                <p className="text-[13px]">{date.split(" ")[1]}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FILTER SWITCHES ---------- */}
        <section className="max-w-[1120px] mx-auto px-4 mt-6">
          <div className="flex flex-wrap gap-6 max-w-[800px] items-center">

            {filterItems.map((item, index) => (
              <button
                key={index}
                className="flex items-center gap-3 cursor-pointer transition-all"
              >
                {/* Custom Switch */}
                <div
                  className={`w-10 h-5 rounded-full flex items-center px-1 transition-all duration-300 
          ${item.active ? "bg-[#4ADE80]" : "bg-gray-200"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300
            ${item.active ? "translate-x-5" : "translate-x-0"}`}
                  ></div>
                </div>

                {/* Label */}
                <span
                  className={`text-[14px] transition-colors
          ${item.active ? "text-[#4ADE80] font-medium" : "text-gray-400"}`}
                >
                  {item.label}
                </span>

                {/* Count badge */}
                <span
                  className={`text-[12px] px-3 py-[2px] rounded-full border transition-all
          ${item.active
                      ? "border-[#4ADE80] text-[#4ADE80] bg-[#ECFDF5]"
                      : "border-gray-300 text-gray-400 bg-white"
                    }`}
                >
                  {item.count}
                </span>
              </button>
            ))}
          </div>
        </section>

        <hr className="my-6"/>

      </div>
    </>
  );
};

export default MyBooking;


/* -------- TAB ITEMS CONFIG -------- */
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

/* -------- FILTERS -------- */
const filterItems = [
  { label: "All services", count: 300, active: true },
  { label: "Engine", count: 4 },
  { label: "Battery", count: 200 },
  { label: "Tire", count: 24 },
  { label: "Electronics", count: 24 },
  { label: "Brake", count: 24 },
];
