// components/NavTabs.tsx
"use client";

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
  id?: number;
};

const NavTabs: React.FC<NavTabsProps> = ({
  tabItems,
  defaultActiveTab,
  onChange,
  id,
}) => {
  const router = useRouter();
  console.log(defaultActiveTab, "defaultActiveTab");

  const [activeTab, setActiveTab] = useState<string>(() => {
    // ✅ Safe access: only read localStorage in the browser
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("active_tab");
      return stored || defaultActiveTab || tabItems[0]?.label || "";
    }
    // During SSR / build, fall back to props
    return defaultActiveTab || tabItems[0]?.label || "";
  });

  console.log(activeTab, "activeTab");

  // ✅ Persist active tab to localStorage whenever it changes (browser only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("active_tab", activeTab);
    }
  }, [activeTab]);

  // ✅ When defaultActiveTab prop changes, update state once
  useEffect(() => {
    if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [defaultActiveTab]);

  const handleTabClick = (item: TabItem, index: number) => {
    setActiveTab(item.label);
    onChange?.(item.label);

    if (item.path) {
      // full reload required ✔
      window.location.href = item.path;
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
      <div className="flex items-center gap-3">
        {tabItems.map((item, idx) => {
          const isActive = activeTab === item.label || id === idx + 1;
          return (
            <button
              key={item.label}
              className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${
                isActive ? "bg-blue-50 !text-[#3F72AF]" : ""
              }`}
              onClick={() => handleTabClick(item, idx)}
            >
              {React.isValidElement(item.icon)
                ? React.cloneElement(
                    item.icon as React.ReactElement<React.SVGProps<SVGSVGElement>>,
                    {
                      stroke: isActive ? "#3F72AF" : "#495057",
                    }
                  )
                : item.icon}

              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NavTabs;
