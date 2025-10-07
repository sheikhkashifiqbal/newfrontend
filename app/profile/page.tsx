"use client";

import MyBookings from "@/components/profile/my-booking";
import ProfileInfo from "@/components/profile/profile-info";
import { useState } from "react";

const Profile = () => {
  const [activeModule, setActiveModule] = useState<
    "Profile info" | "My bookings"
  >("Profile info");

  return (
    <>
      <div className="bg-gray-50">
        {/* Top Tabs */}
        <section className="max-w-[1120px] mx-auto px-4 py-8">
          <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex items-center gap-3">
              <button
                className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${
                  activeModule === "My bookings" && "bg-blue-50 !text-[#3F72AF]"
                }`}
                onClick={() => setActiveModule("My bookings")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  {" "}
                  <path
                    d="M21 10H3M21 12.5V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H12M16 2V6M8 2V6M14.5 19L16.5 21L21 16.5"
                    stroke={
                      activeModule === "My bookings" ? "#3F72AF" : "#495057"
                    }
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />{" "}
                </svg>{" "}
                My bookings
              </button>

              <button
                className={`flex items-center gap-2 p-[14px] rounded-lg hover:bg-blue-50 ${
                  activeModule === "Profile info" &&
                  "bg-blue-50 !text-[#3F72AF]"
                }`}
                onClick={() => setActiveModule("Profile info")}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M3 20C5.33579 17.5226 8.50702 16 12 16C15.493 16 18.6642 17.5226 21 20M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" stroke={ activeModule === "Profile info" ? "#3F72AF" : "#495057" } strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> </svg> Profile info
              </button>
            </div>

            <button
              className="md:flex hidden items-center gap-2 p-[14px] rounded-lg hover:bg-red-50 hover:border-red-100 border"
              onClick={() => console.log("Logging out")}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796" stroke="#E01F22" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> </svg> Log out
            </button>
          </div>
        </section>

        {/* Page Content */}
        {activeModule === "Profile info" && <ProfileInfo />}
        {activeModule === "My bookings" && <MyBookings />}
      </div>
    </>
  );
};

export default Profile;
