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
           
        </div>
    );
};

export default NavTabs;
