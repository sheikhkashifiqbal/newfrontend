// components/NavTabs.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

type TabItem = {
  label: string;
  icon: React.ReactNode;
  path?: string;
};

type NavTabsProps = {
  // tabItems are passed from pages; component may also filter based on localStorage user_type

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
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState<string>(() => {
    // ✅ Safe access: only read localStorage in the browser
    if (typeof window !== "undefined") {
      // First, try to match current pathname with tab items
      const matchingTab = tabItems.find((item) => item.path === pathname);
      if (matchingTab) {
        return matchingTab.label;
      }
      // Then check localStorage
      const stored = window.localStorage.getItem("active_tab");
      return stored || defaultActiveTab || tabItems[0]?.label || "";
    }
    // During SSR / build, fall back to props
    return defaultActiveTab || tabItems[0]?.label || "";
  });
  const [userType, setUserType] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const raw = (window.localStorage.getItem("user_type") || "").trim().toLowerCase();
      return raw === "sparparts_store" ? "spareparts_store" : raw;
    }
    return "";
  });

  const filteredTabItems = React.useMemo(() => {
    if (userType === "spareparts_store") {
      return tabItems.filter((t) => t.label !== "My bookings");
    }
    return tabItems;
  }, [tabItems, userType]);


  // ✅ Persist active tab to localStorage whenever it changes (browser only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("active_tab", activeTab);
    }
  }, [activeTab]);

  // ✅ Sync active tab with current pathname
  useEffect(() => {
    const matchingTab = tabItems.find((item) => item.path === pathname);
    if (matchingTab) {
      setActiveTab(matchingTab.label);
    } else if (defaultActiveTab) {
      setActiveTab(defaultActiveTab);
    }
  }, [pathname, defaultActiveTab, tabItems]);

  const handleTabClick = (item: TabItem, index: number) => {
    setActiveTab(item.label);
    onChange?.(item.label);

    if (item.path) {
      // Use Next.js router for client-side navigation (no page reload)
      router.push(item.path);
    }
  };

  return (
    <div className="flex flex-col-reverse md:flex-row md:items-center gap-3 md:justify-between">
      <div className="flex items-center gap-3">
        {filteredTabItems.map((item, idx) => {
          const isActive = id ? id === idx + 1 : activeTab === item.label;

          return (
            <button
              key={item.label}
              className={`flex items-center gap-2 rounded-lg p-[14px] hover:bg-blue-50 ${isActive ? "bg-blue-50 !text-[#3F72AF]" : ""
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
