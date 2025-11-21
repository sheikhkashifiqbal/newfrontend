// components/NavTabs.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type TabItem = {
  label: string;
  icon: React.ReactNode;
  path?: string;
};

type NavTabsProps = {
  tabItems: TabItem[];
  defaultActiveTab?: string;
  onChange?: (tab: string) => void;
};

const NavTabs: React.FC<NavTabsProps> = ({ tabItems, defaultActiveTab, onChange }) => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem("active_tab") || defaultActiveTab || tabItems[0]?.label;
  });

  useEffect(() => {
    localStorage.setItem("active_tab", activeTab);
  }, [activeTab]);

  const handleTabClick = (item: TabItem) => {
    setActiveTab(item.label);
    onChange?.(item.label);

    if (item.path) {
      window.location.href = item.path; // full reload required ✔
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
      <div className="flex items-center gap-3">
        {tabItems.map((item) => (
          <button
            key={item.label}
            className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${
              activeTab === item.label ? "bg-blue-50 !text-[#3F72AF]" : ""
            }`}
            onClick={() => handleTabClick(item)}
          >
            {React.isValidElement(item.icon)
              ? React.cloneElement(
                  item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>,
                  {
                    stroke: activeTab === item.label ? "#3F72AF" : "#495057",
                  }
                )
              : item.icon}

            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default NavTabs;
