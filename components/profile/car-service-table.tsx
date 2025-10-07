


import React from 'react';

const CarServiceTable = ({ services = [], activeTab = "car" }:any) => {
    return (
        <div className="max-w-[1120px] mx-auto px-4 pb-20">
            {/* Show message if no services */}
            {services.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    No {activeTab.toLowerCase()} services found.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-3xl border border-[#E9ECEF]">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#F8F9FA]">
                            <tr>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider first:rounded-tl-3xl">
                                    Date and Time
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider">
                                    Car model
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider">
                                    Plate number
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider">
                                    Box number
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider">
                                    Service type
                                </th>
                                <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-[#ADB5BD] capitalize tracking-wider">
                                    Required spare part
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200 text-[#495057]">
                            {services.map((service:any, index:number) => (
                                <tr key={service.id} className="hover:bg-gray-50 text-sm">
                                    <td className={`p-6 whitespace-nowrap ${index === services.length - 1 ? 'first:rounded-bl-3xl' : ''}`}>
                                        {service.date}
                                    </td>
                                    <td className="p-6 whitespace-nowrap font-medium">
                                        {service.carModel}
                                    </td>
                                    <td className="p-6 whitespace-nowrap">
                                        {service.plateNumber}
                                    </td>
                                    <td className="p-6 whitespace-nowrap">
                                        {service.boxNumber}
                                    </td>
                                    <td className="p-6 whitespace-nowrap">
                                        {service.serviceType}
                                    </td>
                                    
                                    <td className="p-6 whitespace-nowrap flex justify-between">
                                    <span className={`px-2.5 py-0.5 rounded-full font-medium text-blue-500`}>
                                        {service.action}
                                    </span>
                                    <button>
                                        <img src='/icons/Icon.svg'/>
                                    </button>
                                </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CarServiceTable;
