import { useState } from "react";

export const MakeAReservation = () => {
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedService, setSelectedService] = useState("");
    const [selectedDate, setSelectedDate] = useState("20 Dec");
    const [selectedTime, setSelectedTime] = useState("09:30 AM");

    const carBrands = ["Mercedes", "BMW", "Toyota"];
    const carModels: any = {
        Mercedes: ["C-Class", "E-Class", "S-Class"],
        BMW: ["3 Series", "5 Series", "X5"],
        Toyota: ["Corolla", "Camry", "RAV4"],
    };
    const services = ["Engine", "Battery", "Tire", "Electronics", "Brake"];

    const reservationDates = [
        "20 Dec",
        "21 Dec",
        "22 Dec",
        "23 Dec",
        "24 Dec",
        "25 Dec",
        "26 Dec",
    ];

    const reservationTimes = [
        "09:00 AM",
        "09:30 AM",
        "10:00 AM",
        "10:30 AM",
        "11:00 AM",
        "11:30 AM",
        "12:00 PM",
        "12:30 PM",
        "01:00 PM",
        "01:30 PM",
        "02:00 PM",
        "02:30 PM",
        "02:45 PM",
    ];

    const handleReservation = () => {
        console.log({
            selectedBrand,
            selectedModel,
            selectedService,
            selectedDate,
            selectedTime,
        });
        alert("Reservation made successfully!");
    };

    return (
        <div>
            {/* Car brand, model, service selectors */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {/* Car Brand */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Car brand *
                    </label>

                    <div className="relative bg-white rounded-[8px] border">
                        <select className="appearance-none min-w-[184px] py-2.5 rounded-[8px] px-4 pr-10 text-gray-700"
                            value={selectedBrand}
                            onChange={(e) => {
                                setSelectedBrand(e.target.value);
                                setSelectedModel("");
                            }}
                        >
                            <option value="">Select the car brand</option>
                            {carBrands.map((brand, i) => (
                                <option key={i} value={brand}>
                                    {brand}
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
                    </div >

                </div>

                {/* Brand Model */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Brand model *
                    </label>
                    <div className="relative bg-white rounded-[8px] border">
                        <select className="appearance-none min-w-[184px] py-2.5 rounded-[8px] px-4 pr-10 text-gray-700"
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            disabled={!selectedBrand}
                        >
                            <option value="">Select the model</option>
                            {selectedBrand &&
                                carModels[selectedBrand].map((model: any, i: number) => (
                                    <option key={i}>{model}</option>
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
                </div>

                {/* Service */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service *
                    </label>

                    <div className="relative bg-white rounded-[8px] border">
                        <select className="appearance-none min-w-[184px] py-2.5 rounded-[8px] px-4 pr-10 text-gray-700"
                            value={selectedService}
                            onChange={(e) => setSelectedService(e.target.value)}
                        >
                            <option value="">Select the service</option>
                            {services.map((srv, i) => (
                                <option key={i}>{srv}</option>
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


                </div>
            </div>

            {/* Reservation Date */}
            <div className="mb-6">
                <p className="font-medium text-gray-900 mb-3">Reservation Date</p>
                <div className="flex flex-wrap gap-3">
                    {reservationDates.map((date, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(date)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${selectedDate === date
                                ? "bg-white text-[#3F72AF] border-[#3F72AF]"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {date}
                        </button>
                    ))}
                </div>
            </div>

            {/* Reservation Time */}
            <div className="mb-8">
                <p className="font-medium text-gray-900 mb-3">Reservation time</p>
                <div className="flex flex-wrap gap-3">
                    {reservationTimes.map((time, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedTime(time)}
                            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${selectedTime === time
                                ? "bg-white text-[#3F72AF] border-[#3F72AF]"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                                }`}
                        >
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            {/* Make Reservation Button */}
            <div className="flex justify-center">
                <button
                    onClick={handleReservation}
                    disabled={!selectedBrand || !selectedModel || !selectedService}
                    className={`px-8 py-4 rounded-xl text-white font-medium w-full ${selectedBrand && selectedModel && selectedService
                        ? "bg-[#3F72AF] hover:bg-[#3174c6]"
                        : "bg-gray-400 cursor-not-allowed"
                        }`}
                >
                    Make reservation
                </button>
            </div>
        </div>
    );
};