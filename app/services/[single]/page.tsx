"use client";
import ModalBox from "@/components/model-box";
import React, { useState } from "react";
import { MakeAReservation } from "./MakeAReservation";
import CompanyReviews from "./company-review";

const tabs = [
    { label: "Company Services", icon: "/icons/tool-02.svg" },
    { label: "Company Reviews", icon: "/icons/star.svg" },
];

const carBrands = ["Mercedes", "BMW", "Porsche"];
const services = ["Engine", "Battery", "Tire", "Electronics", "Brake"];

const PerformanceCenterPage = () => {
    const [activeTab, setActiveTab] = useState<any>("Company Services");
    const [openModal, setOpenModal] = useState<any>(false);

    return (
        <>
            <div className="bg-[#F8F9FA] min-h-screen">
                {/* Header */}
                <div className="flex justify-center py-8 px-2 max-w-[1224px] mx-auto">
                    <div className="relative w-full">
                        <img
                            src="/images/single-service.png" // Replace with actual image
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
                                    <p className="text-sm">⭐ 4.5</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Company Info */}
                <section className="max-w-[1120px] mx-auto px-4 text-sm text-gray-700 grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    <div>
                        <p>📍 Bakı ş., Heydər Əliyev pr., 191</p>
                        <a href="#" className="text-blue-500 underline">Google Map</a>
                    </div>
                    <div>
                        <p>🕒 Monday–Friday: 09:00–18:00</p>
                        <p>Saturday: 10:00–16:00</p>
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
                                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 ${activeTab === label
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
                                            <select className="appearance-none bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                                            >
                                                <option>Car brand</option>
                                                {carBrands.map((brand, i) => (
                                                    <option key={i}>{brand}</option>
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
                                        </div >

                                        <div className="relative">
                                            <select className="appearance-none bg-[#E9ECEF] min-w-[184px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700">
                                                <option>Service</option>
                                                {services.map((s, i) => (
                                                    <option key={i}>{s}</option>
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
                                <button onClick={() => setOpenModal(true)}
                                    className="bg-[#3F72AF] hover:bg-[#2753c3] text-white px-6 py-2 rounded-md text-sm">
                                    Make Reservation
                                </button>
                            </div>

                            {/* Services Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-12">
                                {Array(3).fill(carBrands).flat().map((brand, idx) => (
                                    <div key={idx} className="rounded-2xl bg-white p-6 relative">
                                        <div className="flex items-center gap-2 mb-4">
                                            <img
                                                src={`/images/s-logo.png`} // Replace with real brand logos
                                                alt={brand}
                                                className="h-6 w-6 rounded-full object-cover"
                                            />
                                            <p className="font-medium">{brand}</p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {services.map((service, i) => (
                                                <span key={i} className="inline-flex items-center rounded-full border border-[#E9ECEF] bg-white px-3 py-1 text-gray-700">
                                                    {service}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <CompanyReviews/>
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


