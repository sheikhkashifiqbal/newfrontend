'use client'
import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import UpcomingIcon from "@/assets/icons/dashboard/clock-fast-forward.svg";
import CompletedIcon from "@/assets/icons/dashboard/check-circle-broken.svg";
import CancelledIcon from "@/assets/icons/dashboard/slash-circle.svg";
import { useEffect, useState } from "react";
import ServiceBookingsUpcomingTab from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-tab";
import type {
  IServiceBookingReservationRow,
  IReservationServiceSparepart,
} from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-columns";
import { format } from "date-fns"; // ✅ FIX: needed for date label formatting

//:contentReference[oaicite:1]{index=1}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ServiceBookingsListViewProps {
  selectedDayLabel?: string; // e.g. "27 Nov"
  branchId?: string | null;
}

export default function ServiceBookingsListView({
  selectedDayLabel,
  branchId,
}: ServiceBookingsListViewProps) {
  const tabs = [
    {
      index: 0,
      icon: <UpcomingIcon className={"!size-6"} />,
      text: "Pending",
      borderColor: "#00A6FB",
    },
    {
      index: 1,
      icon: <CompletedIcon className={"!size-6 text-[#2DC653]"} />,
      text: "Completed",
      borderColor: "#2DC653",
    },
    {
      index: 2,
      icon: <CancelledIcon className={"!size-6"} />,
      text: "Cancelled",
      borderColor: "#E01E37",
    },
  ];

  const [activeTab, setActiveTab] = useState(0);
  const [reservations, setReservations] = useState<IServiceBookingReservationRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ---------- DATE SORTING BASED ON CLICKED DAY ----------
  function sortBySelectedDay(
    rows: IServiceBookingReservationRow[]
  ): IServiceBookingReservationRow[] {
    if (!selectedDayLabel) return rows;

    return [...rows].sort((a, b) => {
      const aDate = new Date(a.reservation_date);
      const bDate = new Date(b.reservation_date);

      if (isNaN(aDate.getTime()) || isNaN(bDate.getTime())) return 0;

      // "27 Nov" style labels
      const aLabel = format(aDate, "dd MMM");
      const bLabel = format(bDate, "dd MMM");

      const aIsSelected = aLabel === selectedDayLabel;
      const bIsSelected = bLabel === selectedDayLabel;

      // Selected day comes first
      if (aIsSelected && !bIsSelected) return -1;
      if (!aIsSelected && bIsSelected) return 1;

      // Otherwise sort by actual date ascending
      return aDate.getTime() - bDate.getTime();
    });
  }

  // ---------- API CALL ----------
  async function fetchReservations(currentBranchId?: string | null) {
    try {
      setLoading(true);

      let effectiveBranchId: string | null = currentBranchId ?? branchId ?? null;

      // 1) Try localStorage branch_id
      if (typeof window !== "undefined") {
        const storedBranchId = localStorage.getItem("branch_id");
        if (!effectiveBranchId && storedBranchId) {
          effectiveBranchId = storedBranchId;
        }
      }

      // 2) Fallback to auth_response.branch_id
      if (!effectiveBranchId && typeof window !== "undefined") {
        const authRaw = localStorage.getItem("auth_response");
        if (authRaw) {
          try {
            const parsed = JSON.parse(authRaw);
            effectiveBranchId =
              parsed?.branch_id?.toString() ?? parsed?.branchId?.toString() ?? null;
          } catch (e) {
            console.error("Failed to parse auth_response", e);
          }
        }
      }

      if (!effectiveBranchId) {
        console.warn("branch_id not found in localStorage or auth_response");
        setReservations([]);
        return;
      }

      const res = await fetch(`${BASE_URL}/api/reservations/by-branch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branch_id: effectiveBranchId }),
      });

      if (!res.ok) {
        console.error("Failed to fetch reservations", res.status);
        setReservations([]);
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setReservations(data as IServiceBookingReservationRow[]);
      } else {
        setReservations([]);
      }
    } catch (e) {
      console.error("Error fetching reservations", e);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }

  // Load reservations on mount / when branchId changes
  useEffect(() => {
    fetchReservations(branchId);
  }, [branchId]);

  function handleTabClick(index: number) {
    setActiveTab(index);

    // As per requirement: when Upcoming tab is active, re-call API
    if (index === 0) {
      fetchReservations(branchId);
    }
  }

  // ---------- FILTER BY TAB + SORT ----------
  const sortedReservations = sortBySelectedDay(reservations);

  const upcomingReservations = sortedReservations.filter(
    (r) => r.reservation_status === "pending"
  );
  const completedReservations = sortedReservations.filter(
    (r) => r.reservation_status === "completed"
  );
  const cancelledReservations = sortedReservations.filter(
    (r) => r.reservation_status === "cancelled"
  );

  return (
    <div className={"pt-5 flex flex-col gap-y-5"}>
      {/* TOP TABS */}
      <div className={"w-full border-b border-b-soft-gray"}>
        <DashboardContainer>
          <ScrollArea>
            <div className={"flex gap-10"}>
            {tabs.map((tab) => {
              const isActiveTab = tab.index === activeTab;
              const IconComponent = tab.icon;

              // 👉 Dynamic record count logic
              let count = 0;
              if (tab.index === 0) count = upcomingReservations.length;
              if (tab.index === 1) count = completedReservations.length;
              if (tab.index === 2) count = cancelledReservations.length;

              return (
                <div
                  key={tab.text}
                  onClick={() => handleTabClick(tab.index)}
                  style={
                    isActiveTab
                      ? { borderColor: tab.borderColor, borderBottomWidth: "2px" }
                      : {}
                  }
                  className={cn(
                    "cursor-pointer text-sm flex min-w-fit w-[144px] text-misty-gray items-center justify-center gap-3 py-4",
                    isActiveTab && `text-dark-gray font-medium border-b-2`
                  )}
                >
                  {IconComponent}
                  {tab.text} <span className="text-[#3F72AF] font-semibold">({count})</span>
                </div>
              );
            })}

            </div>
            <ScrollBar className={"h-0"} orientation="horizontal" />
          </ScrollArea>
        </DashboardContainer>
      </div>

      {/* TAB CONTENT */}
      {activeTab === 0 && (
        <ServiceBookingsUpcomingTab
          tab="pending"
          data={upcomingReservations}
          onRefresh={() => fetchReservations(branchId)}
          loading={loading}
        />
      )}

      {activeTab === 1 && (
        <ServiceBookingsUpcomingTab
          tab="completed"
          data={completedReservations}
          onRefresh={() => fetchReservations(branchId)}
          loading={loading}
        />
      )}

      {activeTab === 2 && (
        <ServiceBookingsUpcomingTab
          tab="cancelled"
          data={cancelledReservations}
          onRefresh={() => fetchReservations(branchId)}
          loading={loading}
        />
      )}
    </div>
  );
}
