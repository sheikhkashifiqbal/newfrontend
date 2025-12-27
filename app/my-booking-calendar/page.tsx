"use client";

import React, { useState } from "react";
import NavTabs from "@/components/nav-tabs";
import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";

const MyBooking: React.FC = () => {
  const columns = ["Engine 1", "Battery 1", "Oil Change 1", "Oil change 2"];
  const timeSlots = Object.keys(initialBookings);

  const [filters, setFilters] = useState(filterItems);
  const [bookings, setBookings] = useState<any>(initialBookings);
  const [timeSwitches, setTimeSwitches] = useState<any>(
    timeSlots.reduce((x, t) => ({ ...x, [t]: true }), {})
  );
  const [activeCell, setActiveCell] = useState<{ time: string; col: string } | null>(
    null
  );

  const toggleFilter = (i: number) =>
    setFilters((p) => p.map((item, idx) => (idx === i ? { ...item, active: !item.active } : item)));

  const toggleTime = (time: string) =>
    setTimeSwitches((prev: any) => ({ ...prev, [time]: !prev[time] }));

  const handleAddReservation = (time: string, col: string) => {
    alert(`(Future Feature) Open reservation modal for ${col} at ${time}`);
  };

  const handleMakeUnavailable = (time: string, col: string) => {
    setBookings((prev: any) => ({
      ...prev,
      [time]: { ...prev[time], [col]: "block" },
    }));

    setActiveCell(null);
  };

  const [columnSwitches, setColumnSwitches] = useState<any>(
    columns.reduce((acc, col) => ({ ...acc, [col]: true }), {})
  );


  const toggleColumn = (col: string) => {
    setColumnSwitches((prev: any) => ({
      ...prev,
      [col]: !prev[col],
    }));
  };



  return (
    <div className="bg-[#F7F9FC] min-h-screen pb-20 text-[#495057]">
      {/* -------- TOP NAV ---------- */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-6 pt-6">
        <NavTabs tabItems={tabItems} />
      </section>

      {/* -------- PAGE HEADER ---------- */}
      <section className="max-w-[1120px] mx-auto px-4 sm:px-6 mt-8 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-[#3F72AF] text-[26px] sm:text-[32px] font-semibold">
            My Bookings
          </h2>
          <p className="text-[#ADB5BD] text-[15px] sm:text-[17px] mt-2">
            See your scheduled services from your calendar.
          </p>
        </div>

        <button className="flex items-center gap-2 bg-white border rounded-lg px-4 py-3 hover:shadow transition-all w-full sm:w-auto justify-center">
          <svg width="18" height="18" fill="none" stroke="#3F72AF">
            <path d="M3 5H21M3 12H21M3 19H21" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="text-[#3F72AF] font-medium">Switch to list view</span>
        </button>
      </section>



      {/* ---------- DATE SELECTOR ---------- */}
      <section className="max-w-[1120px] mx-auto px-3 sm:px-4 mt-10">
        <div className="flex gap-4 overflow-x-auto scrollbar-none pb-4">
          {["20 Dec", "21 Dec", "22 Dec", "23 Dec", "24 Dec", "25 Dec", "26 Dec"].map(
            (date, i) => (
              <div
                key={i}
                className={`min-w-[65px] sm:min-w-[70px] text-center cursor-pointer rounded-xl border px-4 py-3 text-sm sm:text-base 
                ${i === 0
                    ? "bg-white border-[#3F72AF] shadow-sm text-[#3F72AF] font-semibold"
                    : "text-gray-400 border-gray-200"
                  }`}
              >
                <span className="text-[16px] sm:text-[18px]">{date.split(" ")[0]}</span>
                <p className="text-[12px]">{date.split(" ")[1]}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ---------- FILTER SWITCHES ---------- */}
      <section className="max-w-[1120px] mx-auto px-4 mt-6">
        <div className="flex flex-wrap gap-4 sm:gap-6 max-w-[800px] items-center">
          {filters.map((item, index) => (
            <button
              key={index}
              onClick={() => toggleFilter(index)}
              className="flex items-center gap-3 cursor-pointer transition-all"
            >
              <div
                className={`w-10 h-5 rounded-full flex items-center px-1 transition-all duration-300 ${item.active ? "bg-[#4ADE80]" : "bg-gray-200"
                  }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300 ${item.active ? "translate-x-[18px]" : "-translate-x-[2px]"
                    }`}
                ></div>
              </div>

              <span
                className={`text-[13px] sm:text-[14px] transition-colors ${item.active ? "text-[#4ADE80] font-medium" : "text-gray-400"
                  }`}
              >
                {item.label}
              </span>

              <span
                className={`text-[11px] px-3 py-[2px] rounded-full border transition-all ${item.active
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



      {/* ---------- MAIN GRID (RESPONSIVE SCROLL) ---------- */}
      <div className="overflow-x-auto">
        <hr className="opacity-50 mt-4" />
        {/* ---------- COLUMN HEADER (SCROLLABLE ON MOBILE) ---------- */}
        <div className="py-4">
          <div className="grid grid-cols-[110px_repeat(4,1fr)] min-w-[600px] sm:max-w-[1120px] mx-auto gap-2 px-4 sm:px-6">
            <div></div>
            {columns.map((col) => (
              <button
                key={col}
                onClick={() => toggleColumn(col)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {/* Switch */}
                <div
                  className={`w-10 h-5 px-1 flex items-center rounded-full transition-all duration-300 ${columnSwitches[col] ? "bg-[#4ADE80]" : "bg-gray-300"
                    }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${columnSwitches[col] ? "translate-x-[18px]" : "-translate-x-[2px]"
                      }`}
                  ></div>
                </div>

                {/* Label */}
                <span
                  className={`text-xs sm:text-sm font-medium transition-colors ${columnSwitches[col] ? "text-[#4ADE80]" : "text-gray-400"
                    }`}
                >
                  {col}
                </span>
              </button>
            ))}

          </div>
        </div>
        <hr className="opacity-50 mb-4" />
        
        {timeSlots.map((time) => (
          <div
            key={time}
            className="grid grid-cols-[110px_repeat(4,1fr)] min-w-[600px] sm:max-w-[1120px] mx-auto gap-1 px-4 sm:px-6 py-1 border-b border-dashed"
          >
            {/* Time Toggle */}
            <button
              onClick={() => toggleTime(time)}
              className="flex items-center gap-3 cursor-pointer text-sm sm:text-base"
            >
              <div
                className={`w-11 h-6 rounded-full px-1 flex items-center transition ${timeSwitches[time] ? "bg-[#4ADE80]" : "bg-gray-300"
                  }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full shadow transition ${timeSwitches[time] ? "translate-x-5" : ""
                    }`}
                ></div>
              </div>
              <span>{time}</span>
            </button>

            {columns.map((col) => {
              const cellValue = bookings[time]?.[col];
              const isActive = activeCell?.time === time && activeCell?.col === col;

              if (cellValue === "block") {
                return (
                  <div
                    key={col}
                    className="bg-[#FFF1F1] border border-red-300 rounded-xl flex flex-col items-center justify-center text-center py-4 sm:py-5 min-h-[85px] sm:min-h-[95px]"
                  >
                    <p className="text-red-500 font-semibold text-xs sm:text-sm">Unavailable</p>
                    <p className="text-gray-400 text-[10px] sm:text-xs">{time}</p>
                  </div>
                );
              }

              if (cellValue) {
                return (
                  <div key={col} className="bg-white border border-gray-50 rounded-xl p-3 sm:p-4 min-h-[85px] sm:min-h-[95px]">
                    <div className="flex items-start gap-3">
                      <div>
                        <p className="text-xs sm:text-sm font-medium">{cellValue.vehicle}</p>
                        <p className="text-[10px] sm:text-xs text-gray-500">{cellValue.plate}</p>
                      </div>
                      <button className="-mt-1 -mr-2">
                        <svg fill="#000000" width="22px" height="22px" viewBox="0 0 256 256" id="Flat">
                          <path d="M136,192a8,8,0,1,1-8-8A8.00917,8.00917,0,0,1,136,192ZM128,72a8,8,0,1,0-8-8A8.00917,8.00917,0,0,0,128,72Zm0,48a8,8,0,1,0,8,8A8.00917,8.00917,0,0,0,128,120Z" />
                        </svg>
                      </button>
                    </div>

                    <span className="text-[10px] sm:text-xs bg-gray-100 px-2 py-1 rounded-full mt-2 inline-block">
                      {cellValue.type}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={col}
                  onClick={() => setActiveCell({ time, col })}
                  className={`relative min-h-[85px] sm:min-h-[95px] rounded-xl transition cursor-pointer ${isActive && "bg-transparent"
                    }`}
                >
                  {!isActive ? (
                    <div className="flex items-center justify-center h-full group">
                      <span className="text-[#3F72AF] text-xs sm:text-sm opacity-0 bg-blue-50 h-full w-full flex justify-center items-center rounded-xl border border-dashed group-hover:opacity-100">
                        + Click here
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2 justify-center h-full px-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddReservation(time, col);
                        }}
                        className="bg-[#E9F2FF] border border-[#3F72AF]/50 text-[#3F72AF] text-xs sm:text-sm px-4 py-2 sm:py-3 rounded-lg w-full hover:bg-[#3F72AF]/10"
                      >
                        + Add new reservation
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMakeUnavailable(time, col);
                        }}
                        className="bg-[#FFF5F5] border border-red-300 text-red-500 text-xs sm:text-sm px-4 py-2 sm:py-3 rounded-lg w-full hover:bg-red-50"
                      >
                        Make unavailable
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBooking;

/* ---------- STATIC CONFIG ---------- */
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

const filterItems = [
  { label: "All services", count: 300, active: true },
  { label: "Engine", count: 4, active: false },
  { label: "Battery", count: 200, active: false },
  { label: "Tire", count: 24, active: false },
  { label: "Electronics", count: 24, active: false },
  { label: "Brake", count: 24, active: false },
];

const initialBookings: any = {
  "09:00": {
    "Engine 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-999", type: "Engine" },
    "Battery 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-666", type: "Battery" },
    "Oil Change 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-444", type: "Oil Change" },
  },
  "09:30": {
    "Battery 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-666", type: "Battery" },
    "Oil Change 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-444", type: "Oil Change" },
  },
  "10:00": {},
  "10:30": {
    "Engine 1": { vehicle: "Mercedes Benz CL 65 AMG", plate: "99-AA-999", type: "Engine" },
  },
};
