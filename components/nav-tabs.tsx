// components/NavTabs.tsx
import React, { useState } from "react";

type TabItem = {
    label: string;
    icon: React.ReactNode;
};

type NavTabsProps = {
    tabItems: TabItem[];
    defaultActiveTab?: string;
    onChange?: (tab: string) => void;
};

const NavTabs: React.FC<NavTabsProps> = ({ tabItems, defaultActiveTab, onChange }) => {
    const [activeTab, setActiveTab] = useState(defaultActiveTab || tabItems[0]?.label);

    const handleTabClick = (label: string) => {
        setActiveTab(label);
        onChange?.(label); // Optional callback to parent
    };

    return (
        <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
            <div className="flex items-center gap-3">
                {tabItems.map(({ label, icon }) => (
                    <button
                        key={label}
                        className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${activeTab === label ? "bg-blue-50 !text-[#3F72AF]" : ""
                            }`}
                        onClick={() => handleTabClick(label)}
                    >
                        {/* Clone icon and apply dynamic stroke if possible */}
                        {React.isValidElement(icon)
                            ? React.cloneElement(
                                icon as React.ReactElement<React.SVGProps<SVGSVGElement>>,
                                {
                                    stroke: activeTab === label ? "#3F72AF" : "#495057",
                                }
                            )
                            : icon}

                        {label}
                    </button>
                ))}
            </div>
            {/* Log out button (desktop only) */}
            <button
                className="md:flex hidden items-center gap-2 p-[14px] rounded-lg hover:bg-red-50 hover:border-red-100 border"
                onClick={() => console.log("Logging out")}
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                        d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796"
                        stroke="#E01F22"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Log out
            </button>
        </div>
    );
};

export default NavTabs;
