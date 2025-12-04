'use client'

import DashboardHeaderText from "@/components/dashboard/DashboardHeaderText";
import { useEffect, useState, type ChangeEvent } from "react";
import { addDays, format } from "date-fns";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { cn } from "@/lib/utils";
import ServiceBookingsCalendar from "@/components/dashboard/service/my-bookings/calendar-view/service-bookings-calendar";
import ServiceBookingsListView from "@/components/dashboard/service/my-bookings/list-view/service-bookings-list-view";

export default function ServiceBookings() {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    return {
      fullDate: format(d, 'dd MMM yyy'),
      day: format(d, 'dd MMM'),
      isoDate: format(d, 'yyyy-MM-dd'),
    };
  });

  const [date, setDate] = useState(next7Days[0]);
  const [branchOptions, setBranchOptions] = useState<{ branch_id: number; branch_name: string }[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialBranchId: string | null = null;
    let branchList: { branch_id: number; branch_name: string }[] = [];

    const authRaw = localStorage.getItem("auth_response");
    if (authRaw) {
      try {
        const parsed = JSON.parse(authRaw);
        if (Array.isArray(parsed?.branch_list)) {
          branchList = parsed.branch_list
            .filter((b: any) => b && (b.branch_id ?? b.branchId))
            .map((b: any) => ({
              branch_id: Number(b.branch_id ?? b.branchId),
              branch_name: String(b.branch_name ?? b.branchName ?? ""),
            }));
        }

        if (parsed?.branch_id ?? parsed?.branchId) {
          initialBranchId = String(parsed.branch_id ?? parsed.branchId);
        }
      } catch (e) {
        console.error("Failed to parse auth_response", e);
      }
    }

    const storedBranchId = localStorage.getItem("branch_id");
    if (storedBranchId) {
      initialBranchId = storedBranchId;
    } else if (!initialBranchId && branchList.length > 0) {
      initialBranchId = String(branchList[0].branch_id);
    }

    if (branchList.length > 0) {
      setBranchOptions(branchList);
    }

    if (initialBranchId) {
      setSelectedBranchId(initialBranchId);
      localStorage.setItem("branch_id", initialBranchId);
    }
  }, []);

  function handleBranchChange(event: ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value || null;
    setSelectedBranchId(value);
    if (typeof window !== "undefined" && value) {
      localStorage.setItem("branch_id", value);
    }
  }

  function switchViewMode() {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
  }

  return (
    <div className={'pt-5 flex flex-col gap-y-5'}>
      <DashboardHeaderText
        viewMode={viewMode}
        switchViewMode={switchViewMode}
        title={"My Bookings"}
        subtitle={"See your scheduled services from your calendar."}
      />

      {branchOptions.length > 0 && (
        <DashboardContainer>
          <div className="flex flex-col gap-2 max-w-xs">
            <label className="text-xs font-medium text-dark-gray">Select Branch</label>
            <select
              className="h-10 rounded-md border border-soft-gray bg-white px-3 text-sm text-dark-gray"
              value={selectedBranchId ?? ""}
              onChange={handleBranchChange}
            >
              <option value="">Select branch</option>
              {branchOptions.map((b) => (
                <option key={b.branch_id} value={String(b.branch_id)}>
                  {b.branch_name}
                </option>
              ))}
            </select>
          </div>
        </DashboardContainer>
      )}

      <DashboardContainer>
        <div className={'flex gap-2'}>
          {next7Days.map((day) => {
            const [num, month] = day.day.split(' ');
            return (
              <div
                onClick={() => setDate(day)}
                key={day.fullDate}
                className={cn(
                  'cursor-pointer bg-inherit border-soft-gray flex flex-col h-16 w-[4.5rem] px-2 rounded-xl items-center justify-center text-dove-gray font-medium',
                  date.fullDate === day.fullDate && 'bg-white text-dark-gray border'
                )}
              >
                <h5 className={'text-xl'}>{num}</h5>
                <h6 className={'text-sm'}>{month}</h6>
              </div>
            )
          })}
        </div>
      </DashboardContainer>

      {viewMode === "calendar" ? (
        <ServiceBookingsCalendar date={date} branchId={selectedBranchId} />
      ) : (
        <ServiceBookingsListView
          selectedDayLabel={date.day}
          branchId={selectedBranchId}
        />
      )}
    </div>
  )
}
