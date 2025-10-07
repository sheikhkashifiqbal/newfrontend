import React, { useState } from "react";
import CarServiceTable from "@/components/profile/car-service-table";

// Define a union type for tab statuses
type TabStatus = "Upcoming" | "Completed" | "Cancelled" | "Pending";

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState<TabStatus>("Upcoming");

  // Sample data for demonstration - in a real app, this would come from an API
  const allServices = [
    {
      id: 1,
      date: "20.12.2024, 14:30",
      carModel: "Mercedes Benz CL 65 AMG",
      plateNumber: "99-AA-999",
      boxNumber: "#1",
      serviceType: "Engine",
      action: "Add",
      requiredPart: ":",
      status: "Upcoming"
    },
    {
      id: 2,
      date: "21.12.2024, 10:15",
      carModel: "BMW X5",
      plateNumber: "88-BB-888",
      boxNumber: "#2",
      serviceType: "Oil Change",
      action: "View / Edit",
      requiredPart: "Oil Filter",
      status: "Completed"
    },
    {
      id: 3,
      date: "22.12.2024, 16:45",
      carModel: "Audi A4",
      plateNumber: "77-CC-777",
      boxNumber: "#3",
      serviceType: "Brakes",
      action: "Add",
      requiredPart: "Brake Pads",
      status: "Cancelled"
    },
    {
      id: 4,
      date: "23.12.2024, 09:30",
      carModel: "Volkswagen Golf",
      plateNumber: "66-DD-666",
      boxNumber: "#1",
      serviceType: "Tire Rotation",
      action: "Add",
      requiredPart: ":",
      status: "Pending"
    },
    {
      id: 5,
      date: "24.12.2024, 11:00",
      carModel: "Toyota Camry",
      plateNumber: "55-EE-555",
      boxNumber: "#4",
      serviceType: "Engine",
      action: "View / Edit",
      requiredPart: "Spark Plugs",
      status: "Upcoming"
    },
    {
      id: 6,
      date: "25.12.2024, 14:20",
      carModel: "Honda Civic",
      plateNumber: "44-FF-444",
      boxNumber: "#2",
      serviceType: "Transmission",
      action: "Add",
      requiredPart: "Transmission Fluid",
      status: "Completed"
    }
  ];

  // Filter services based on active tab
  const filteredServices = allServices.filter(
    (service) => service.status === activeTab
  );

  // Count services for each tab
  const tabCounts: Record<TabStatus, number> = {
    Upcoming: allServices.filter((service) => service.status === "Upcoming").length,
    Completed: allServices.filter((service) => service.status === "Completed").length,
    Cancelled: allServices.filter((service) => service.status === "Cancelled").length,
    Pending: allServices.filter((service) => service.status === "Pending").length,
  };

  return (
    <>
      {/* Section Title */}
      <section className="flex flex-col sm:flex-row items-start justify-between sm:items-end gap-4 max-w-[1120px] mx-auto px-4 mb-8">
        <div className="">
          <h2 className="text-[#3F72AF] text-2xl md:text-[32px] font-semibold">
            My Bookings
          </h2>
          <p className="text-[#ADB5BD] text-xl md:text-[20px] mt-2">
            See your scheduled services from your calendar.
          </p>
        </div>
        <button
          className={`flex items-center gap-2 rounded-lg p-[14px] px-[16px] text-sm font-medium bg-blue-50 !text-[#424242]`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
              stroke="#3F72AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Switch to calendar view
        </button>
      </section>

      {/* Calendar buttons (static mockup) */}
      <section className="max-w-[1120px] mx-auto flex flex-wrap gap-2 px-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((_, idx) => (
          <button
            key={idx}
            className="text-[#CED4DA] min-w-[72px] hover:bg-white py-2 px-5 rounded-xl border border-transparent hover:border-[#E9ECEF] hover:text-gray-600 text-xl font-medium flex flex-col items-center"
          >
            {20 + idx + 1}
            <span>Dec</span>
          </button>
        ))}
      </section>

      {/* Tabs */}
      <section className="border-b border-gray-200 mb-8">
        <div className="flex gap-3 sm:gap-10 max-w-[1120px] mx-auto px-4">
          {(["Upcoming", "Completed", "Cancelled", "Pending"] as TabStatus[]).map((tab) => {
            const isActive = activeTab === tab;
            const borderColor =
              tab === "Upcoming"
                ? "border-blue-400"
                : tab === "Completed"
                ? "border-green-400"
                : tab === "Cancelled"
                ? "border-red-500"
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
                    tab === "Upcoming"
                      ? "/icons/clock-fast-forward.svg"
                      : tab === "Completed"
                      ? "/icons/check-circle-broken.svg"
                      : tab === "Cancelled"
                      ? "/icons/delete.svg"
                      : "/icons/clock-refresh.svg"
                  }
                  width={24}
                  alt={`${tab} icon`}
                />
                <p>{tab}</p>
                <span className="px-3 py-[2px] border border-[#E9ECEF] rounded-3xl">
                  {tabCounts[tab]}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Pass filtered services to the table */}
      <CarServiceTable services={filteredServices} />
    </>
  );
};

export default MyBookings;
