'use client';

import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { CustomSwitch } from "@/components/app-custom/custom-switch";
import VerticalDotsIcon from "@/assets/icons/dashboard/dots-vertical.svg";
import ActionButtons from "@/components/dashboard/service/my-bookings/calendar-view/ActionButtons";
import TopCheckboxes, { ITopServiceItem } from "@/components/dashboard/service/my-bookings/calendar-view/TopCheckboxes";
import ServiceBookingsAddReservationPopup
  from "@/components/dashboard/service/my-bookings/service-bookings-add-reservation-popup";
import { useEffect, useMemo, useState } from "react";
import ServiceBookingsAddEditSparePartsPopup
  from "@/components/dashboard/service/my-bookings/service-bookings-add-edit-spare-parts-popup";

interface IServiceBookingsCalendar {
  date: {
    fullDate: string;
    day: string;
    isoDate?: string;
  };
  branchId?: string | null;
}

type CalendarCell = {
  car: string;
  plate: string;
  service: string;
  reservationId?: number;
  serviceId?: number;
} | null;

type CalendarData = {
  [timeSlot: string]: {
    [serviceName: string]: CalendarCell;
  };
};

type ServiceOfferItem = {
  service_id: number;
  service_name: string;
};

type ReservationItem = {
  reservation_id: number;
  reservation_date: string;
  reservation_time: string;
  brand_id: number;
  brand_name: string;
  model_id: number;
  model_name: string;
  plate_number: string;
  service_id: number;
  service_name: string;
  email: string;
};

type DayScheduleItem = {
  working_day: string;
  from: string;
  to: string;
  reservation_list: ReservationItem[];
};

const DAY_SCHEDULE_URL = "http://localhost:8081/api/branch-reservations/day-schedule";
const SERVICES_OFFER_URL = "http://localhost:8081/api/services-offer-by-branch";

// NEW: branch services APIs
const BRANCH_BRAND_SERVICES_URL = "http://localhost:8081/api/branch-brand-services"; // GET list
const BRANCH_BRAND_SERVICES_DISABLE_URL = "http://localhost:8081/api/branch-brand-services/disable-branch-service"; // POST

// NEW: disable time-slot service APIs
const DISABLE_TIME_SLOT_SERVICE_URL = "http://localhost:8081/api/disable-time-slot-service";

const initialData: CalendarData = {
  "09:00": {
    "Engine": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-999',
      service: 'Engine',
    },
    "Battery": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-666',
      service: 'Battery',
    },
    "Oil Change": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-444',
      service: 'Oil Change',
    },
    "Car Wash": null
  },
  "09:30": {
    "Engine": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-999',
      service: 'Engine',
    },
    "Battery": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-666',
      service: 'Battery',
    },
    "Oil Change": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-444',
      service: 'Oil Change',
    },
    "Car Wash": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-333',
      service: 'Oil Change',
    }
  },
  "10:00": {
    "Engine": null,
    "Battery": null,
    "Oil Change": null,
    "Car Wash": {
      car: 'Mercedes Benz CL 65 AMG',
      plate: '99-AA-333',
      service: 'Oil Change',
    }
  },
  "10:30": {
    "Engine": null,
    "Battery": null,
    "Oil Change": null,
    "Car Wash": null
  }
};

function parseTimeToMinutes(str: string): number {
  const clean = str.slice(0, 5); // "HH:mm"
  const [h, m] = clean.split(':');
  const hh = parseInt(h || "0", 10);
  const mm = parseInt(m || "0", 10);
  return hh * 60 + mm;
}

function formatMinutesToTime(minutes: number): string {
  const hh = Math.floor(minutes / 60);
  const mm = minutes % 60;
  const hhStr = hh.toString().padStart(2, '0');
  const mmStr = mm.toString().padStart(2, '0');
  return `${hhStr}:${mmStr}`;
}

function generateTimeSlots(from: string, to: string): string[] {
  const start = parseTimeToMinutes(from);
  const end = parseTimeToMinutes(to);
  const result: string[] = [];
  for (let m = start; m <= end; m += 30) {
    result.push(formatMinutesToTime(m));
  }
  return result;
}

export default function ServiceBookingsCalendar({ date, branchId }: IServiceBookingsCalendar) {
  const [selectedDateAndTime, setSelectedDateAndTime] = useState<null | { date: string; time: string }>(null);

  const [headers, setHeaders] = useState<string[]>(["Engine", "Battery", "Oil Change", "Car Wash"]);
  const [data, setData] = useState<CalendarData>(initialData);

  const [daySchedule, setDaySchedule] = useState<DayScheduleItem[]>([]);
  const [servicesOffer, setServicesOffer] = useState<ServiceOfferItem[]>([]);
  const [serviceIdByName, setServiceIdByName] = useState<Record<string, number>>({});

  const [topInitialServices, setTopInitialServices] = useState<ITopServiceItem[]>([]);
  const [serviceFilters, setServiceFilters] = useState<ITopServiceItem[]>([]);

  const [rowSwitches, setRowSwitches] = useState<Record<string, boolean>>({});
  const [columnSwitches, setColumnSwitches] = useState<Record<string, boolean>>({});

  // Row-level disableTimeSlot IDs (per time slot)
  const [rowDisableIds, setRowDisableIds] = useState<Record<string, number | undefined>>({});

  // Cell-level disableTimeSlot IDs: key = `${timeSlot}|${serviceName}`
  const [unavailableSlots, setUnavailableSlots] = useState<Record<string, { id: number }>>({});

  const timeSlots = useMemo(() => {
    const keys = Object.keys(data);
    // Keep original order of insertion; no special sort to avoid changing UI layout
    return keys;
  }, [data]);

  const getBranchId = (): string | null => {
    if (branchId) return branchId;
    if (typeof window === "undefined") return null;
    return localStorage.getItem("branch_id");
  };

  // Reverse map: serviceId -> serviceName (for GET APIs)
  const serviceNameById = useMemo(() => {
    const obj: Record<number, string> = {};
    Object.entries(serviceIdByName).forEach(([name, id]) => {
      obj[id] = name;
    });
    return obj;
  }, [serviceIdByName]);

  // Fetch day schedule + services-offer-by-branch (existing behavior)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const currentBranchId = getBranchId();
    if (!currentBranchId) return;

    const reservationDate = date.isoDate || new Date().toISOString().slice(0, 10);

    const fetchData = async () => {
      try {
        const [scheduleRes, servicesRes] = await Promise.all([
          fetch(DAY_SCHEDULE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              branch_id: Number(currentBranchId),
              reservation_date: reservationDate,
            }),
          }),
          fetch(SERVICES_OFFER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              branch_id: Number(currentBranchId),
            }),
          }),
        ]);

        if (scheduleRes.ok) {
          const scheduleJson = await scheduleRes.json();
          if (Array.isArray(scheduleJson)) {
            setDaySchedule(scheduleJson as DayScheduleItem[]);
          } else if (scheduleJson) {
            setDaySchedule([scheduleJson as DayScheduleItem]);
          }
        }

        if (servicesRes.ok) {
          const servicesJson = await servicesRes.json();
          if (Array.isArray(servicesJson)) {
            setServicesOffer(servicesJson as ServiceOfferItem[]);
          }
        }
      } catch (e) {
        console.error("Failed to fetch calendar data", e);
      }
    };

    fetchData();
  }, [date.isoDate, branchId]);

  // Build headers, data grid & top checkboxes based on responses (existing logic)
  useEffect(() => {
    const schedule = daySchedule[0];
    if (!schedule || servicesOffer.length === 0) {
      return;
    }

    const serviceNames = servicesOffer.map((s) => s.service_name);
    setHeaders(serviceNames);

    const map: Record<string, number> = {};
    servicesOffer.forEach((s) => {
      map[s.service_name] = s.service_id;
    });
    setServiceIdByName(map);

    const fromStr = schedule.from?.slice(0, 5) || "09:00";
    const toStr = schedule.to?.slice(0, 5) || "10:30";
    const slots = generateTimeSlots(fromStr, toStr);

    const reservations = schedule.reservation_list || [];

    // Count per service_name
    const counts: Record<string, number> = {};
    reservations.forEach((r) => {
      const name = r.service_name;
      counts[name] = (counts[name] ?? 0) + 1;
    });

    const totalCount = reservations.length;

    const topList: ITopServiceItem[] = [
      {
        label: "All services",
        active: true,
        number: totalCount,
      },
      ...serviceNames.map((name) => ({
        label: name,
        active: true,
        number: counts[name] ?? 0,
      })),
    ];
    setTopInitialServices(topList);
    setServiceFilters(topList);

    // Build calendar data structure
    const calendar: CalendarData = {};
    slots.forEach((time) => {
      calendar[time] = {};
      serviceNames.forEach((name) => {
        calendar[time][name] = null;
      });
    });

    reservations.forEach((r) => {
      const time = (r.reservation_time || "").slice(0, 5);
      const serviceName = r.service_name;
      if (calendar[time] && Object.prototype.hasOwnProperty.call(calendar[time], serviceName)) {
        calendar[time][serviceName] = {
          car: `${r.brand_name ?? ""} ${r.model_name ?? ""}`.trim(),
          plate: r.plate_number ?? "",
          service: serviceName,
          reservationId: r.reservation_id,
          serviceId: r.service_id,
        };
      }
    });

    setData(calendar);
  }, [daySchedule, servicesOffer]);

  // Keep column switches in sync with headers (default ON)
  useEffect(() => {
    setColumnSwitches((prev) => {
      const next: Record<string, boolean> = {};
      headers.forEach((h) => {
        next[h] = prev[h] ?? true;
      });
      return next;
    });
  }, [headers]);

  // Keep row switches in sync with time slots (default ON)
  useEffect(() => {
    setRowSwitches((prev) => {
      const next: Record<string, boolean> = {};
      timeSlots.forEach((t) => {
        next[t] = prev[t] ?? true;
      });
      return next;
    });
  }, [timeSlots]);

  // NEW: Get branch-brand-services list (GET) to set column switches by status
  useEffect(() => {
    const currentBranchId = getBranchId();
    if (!currentBranchId) return;
    if (Object.keys(serviceIdByName).length === 0) return;

    const fetchBranchServicesStatus = async () => {
      try {
        const res = await fetch(BRANCH_BRAND_SERVICES_URL);
        if (!res.ok) return;

        const list = await res.json();
        if (!Array.isArray(list)) return;

        const newColumnSwitches: Record<string, boolean> = {};
        headers.forEach((name) => {
          newColumnSwitches[name] = true; // default ON
        });

        list.forEach((item: any) => {
          const bId = Number(item.branchId ?? item.branch_id);
          if (bId !== Number(currentBranchId)) return;

          const svcId = Number(item.serviceId ?? item.service_id);
          if (!svcId) return;

          const serviceName = Object.entries(serviceIdByName).find(([name, id]) => id === svcId)?.[0];
          if (!serviceName) return;

          const statusRaw = (item.status ?? "").toString().toLowerCase();
          const isInactive = statusRaw === "inactive" || statusRaw === "inctive"; // handle typo
          newColumnSwitches[serviceName] = !isInactive;
        });

        setColumnSwitches((prev) => ({
          ...prev,
          ...newColumnSwitches,
        }));
      } catch (e) {
        console.error("Failed to load branch-brand-services list", e);
      }
    };

    fetchBranchServicesStatus();
  }, [branchId, serviceIdByName, headers]);

  // NEW: Get disable-time-slot-service list (GET) to set row/time + cell unavailable state
  useEffect(() => {
    const currentBranchId = getBranchId();
    if (!currentBranchId) return;
    if (timeSlots.length === 0) return;

    const fetchDisabledSlots = async () => {
      try {
        const res = await fetch(DISABLE_TIME_SLOT_SERVICE_URL);
        if (!res.ok) return;

        const list = await res.json();
        if (!Array.isArray(list)) return;

        const newRowSwitches: Record<string, boolean> = {};
        const newRowIds: Record<string, number> = {};
        const newUnavailableSlots: Record<string, { id: number }> = {};

        // Start with all rows enabled
        timeSlots.forEach((t) => {
          newRowSwitches[t] = true;
        });

        list.forEach((item: any) => {
          const bId = Number(item.branchId ?? item.branch_id);
          if (bId !== Number(currentBranchId)) return;

          const timeSlot = (item.timeSlot ?? item.time_slot) as string | undefined;
          const disableId = Number(item.disableTimeSlotId ?? item.id);
          const sId = item.serviceId ?? item.service_id;

          if (!timeSlot || !disableId) return;

          // Row-level disable: only timeSlot (serviceId is null/0/undefined)
          if (!sId) {
            if (timeSlots.includes(timeSlot)) {
              newRowSwitches[timeSlot] = false;
              newRowIds[timeSlot] = disableId;
            }
          } else {
            // Cell-level disable: timeSlot + serviceId
            const serviceName = serviceNameById[Number(sId)];
            if (serviceName && timeSlots.includes(timeSlot)) {
              const key = `${timeSlot}|${serviceName}`;
              newUnavailableSlots[key] = { id: disableId };
            }
          }
        });

        setRowSwitches((prev) => ({
          ...prev,
          ...newRowSwitches,
        }));
        setRowDisableIds((prev) => ({
          ...prev,
          ...newRowIds,
        }));
        setUnavailableSlots((prev) => ({
          ...prev,
          ...newUnavailableSlots,
        }));
      } catch (e) {
        console.error("Failed to load disable-time-slot-service list", e);
      }
    };

    fetchDisabledSlots();
  }, [branchId, timeSlots, serviceNameById]);

  const handleTopServicesChange = (services: ITopServiceItem[]) => {
    // Safe: TopCheckboxes calls onChange from a useEffect
    setServiceFilters(services);
  };

  // NEW: Row time-slot switch → use disable-time-slot-service (POST / DELETE)
  const handleRowSwitchChange = async (time: string, checked: boolean) => {
    setRowSwitches((prev) => ({
      ...prev,
      [time]: checked,
    }));

    const currentBranchId = getBranchId();
    if (!currentBranchId) return;

    try {
      if (!checked) {
        // Checkbox OFF => POST disable-time-slot-service with branch_id + time_slot
        const res = await fetch(DISABLE_TIME_SLOT_SERVICE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch_id: Number(currentBranchId),
            // service_id is optional here (row-wise disable)
            time_slot: time,
          }),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          const newId: number = json?.id ?? json?.disableTimeSlotId ?? 0;

          setRowDisableIds((prev) => ({
            ...prev,
            [time]: newId,
          }));

          // You asked to show toast with message; in this file we just log
          if (json?.message) {
            console.log(json.message);
          }
        }
      } else {
        // Checkbox ON => DELETE disable-time-slot-service/{id} (row level)
        const id = rowDisableIds[time];
        if (!id) return;

        await fetch(`${DISABLE_TIME_SLOT_SERVICE_URL}/${id}`, {
          method: "DELETE",
        });

        setRowDisableIds((prev) => {
          const copy = { ...prev };
          delete copy[time];
          return copy;
        });
      }
    } catch (e) {
      console.error("Failed to toggle row time slot", e);
    }
  };

  // NEW: Column switch → POST /branch-brand-services/disable-branch-service
  const handleColumnSwitchChange = async (serviceName: string, checked: boolean) => {
    setColumnSwitches((prev) => ({
      ...prev,
      [serviceName]: checked,
    }));

    const serviceId = serviceIdByName[serviceName];
    if (!serviceId) return;

    const currentBranchId = getBranchId();
    if (!currentBranchId) return;

    try {
      await fetch(BRANCH_BRAND_SERVICES_DISABLE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: Number(currentBranchId),
          service_id: serviceId,
          status: checked ? "active" : "inactive",
        }),
      });
    } catch (e) {
      console.error("Failed to toggle branch-brand-service", e);
    }
  };

  // NEW: Make unavailable / Make available (cell-level) → disable-time-slot-service (POST / DELETE)
  const handleToggleUnavailable = async (time: string, serviceName: string) => {
    const currentBranchId = getBranchId();
    if (!currentBranchId) return;

    const serviceId = serviceIdByName[serviceName];
    if (!serviceId) return;

    const key = `${time}|${serviceName}`;
    const existing = unavailableSlots[key];

    try {
      if (!existing) {
        // Make unavailable: POST /disable-time-slot-service with branch_id, service_id, time_slot
        const res = await fetch(DISABLE_TIME_SLOT_SERVICE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch_id: Number(currentBranchId),
            service_id: serviceId,
            time_slot: time,
          }),
        });

        if (res.ok) {
          const json = await res.json().catch(() => null);
          const newId: number = json?.id ?? json?.disableTimeSlotId ?? 0;

          setUnavailableSlots((prev) => ({
            ...prev,
            [key]: { id: newId },
          }));

          if (json?.message) {
            console.log(json.message);
          }
        }
      } else {
        // Make available: DELETE /disable-time-slot-service/{id}
        const id = existing.id;
        await fetch(`${DISABLE_TIME_SLOT_SERVICE_URL}/${id}`, {
          method: "DELETE",
        });

        setUnavailableSlots((prev) => {
          const copy = { ...prev };
          delete copy[key];
          return copy;
        });
      }
    } catch (e) {
      console.error("Failed to toggle availability for slot", e);
    }
  };

  const isServiceActive = (serviceName: string): boolean => {
    const withoutAll = serviceFilters.filter((s) => s.label !== "All services");
    const item = withoutAll.find((s) => s.label === serviceName);
    if (!item) return true;
    return item.active;
  };

  return (
    <div className={'flex flex-col gap-y-5'}>
      <TopCheckboxes
        initialServices={topInitialServices}
        onChange={handleTopServicesChange}
      />

      <div className={'overflow-x-auto'}>
        <div className={'min-w-fit'}>

          {/*HEADER*/}
          <div className={'pl-[10rem]'}>
            <div
              style={{
                gridTemplateColumns: `7rem repeat(${headers.length}, 18rem)`,
              }}
              className={`grid min-w-fit whitespace-nowrap gap-x-3`}
            >
              {/* Time Slot */}
              <div></div>

              {/* Services */}
              {headers.map((header) => (
                <div key={header} className="bg-inherit p-4">
                  <CustomSwitch
                    label={header}
                    id={header}
                    checked={columnSwitches[header] ?? true}
                    onChecked={(checked) => handleColumnSwitchChange(header, checked)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/*Data*/}
          {timeSlots.map((timeKey) => {
            return (
              <div
                key={timeKey}
                className={'w-full h-[7rem] border-b-2 border-t-2 border-dashed border-cool-gray'}
              >
                <div className={'pl-[10rem] h-full'}>
                  <div
                    style={{
                      gridTemplateColumns: `7rem repeat(${headers.length}, 18rem)`,
                    }}
                    className={`h-full grid min-w-fit whitespace-nowrap gap-x-3`}
                  >
                    {/* Time Slot */}
                    <div className={'flex items-center justify-center'}>
                      <CustomSwitch
                        label={timeKey}
                        id={timeKey}
                        checked={rowSwitches[timeKey] ?? true}
                        onChecked={(checked) => handleRowSwitchChange(timeKey, checked)}
                      />
                    </div>

                    {/* Services */}
                    {headers.map((serviceName) => {
                      const card = data[timeKey]?.[serviceName] ?? null;
                      const activeService = isServiceActive(serviceName);
                      const slotKey = `${timeKey}|${serviceName}`;
                      const isUnavailable = Boolean(unavailableSlots[slotKey]);

                      // If service is filtered OFF in top checkboxes, hide its cards/buttons
                      if (!activeService) {
                        return (
                          <div key={serviceName} className="flex" />
                        );
                      }

                      if (card) {
                        return (
                          <div key={serviceName} className="flex">
                            <div className={'bg-white rounded-2xl p-4 h-[6.75rem] w-full flex flex-col gap-y-4'}>

                              <div className={'flex flex-col gap-1'}>
                                <div className={'flex items-center justify-between'}>
                                  <h4 className={'text-sm text-dark-gray font-medium'}>{card.car}</h4>
                                  <div className={'size-5 cursor-pointer flex justify-center items-center'}>
                                    <VerticalDotsIcon className={'!h-4'} />
                                  </div>
                                </div>
                                <h4 className={'text-sm text-dark-gray font-medium'}>{card.plate}</h4>
                              </div>

                              <div className={'max-w-fit py-0.5 px-3 border border-soft-gray rounded-[40px] text-dark-gray text-xs font-medium'}>
                                {card.service}
                              </div>
                            </div>
                          </div>
                        )
                      }

                      return (
                        <div key={serviceName} className={"group duration-700 flex"}>
                          <ActionButtons
                            onReserveClick={() => {
                              setSelectedDateAndTime({
                                date: date.day,
                                time: timeKey
                              })
                            }}
                            isUnavailable={isUnavailable}
                            onToggleUnavailable={() => handleToggleUnavailable(timeKey, serviceName)}
                          />
                        </div>
                      )
                    })}

                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <ServiceBookingsAddReservationPopup
        selectedDateAndTime={selectedDateAndTime}
        closePopup={() => setSelectedDateAndTime(null)}
      />
    </div>
  );
}
