// =============================================
// File: components/services/service-card-modal.tsx (Final — Full Restored Functionality)
// =============================================
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CarSelector } from "@/components/services/selectors/car-selector-res";
import { CarModelSelector } from "@/components/services/selectors/car-model-selector-res";
import { ServiceSelector } from "@/components/services/selectors/service-selector-res";
import { addDays, format, parse } from "date-fns";
import { memo, useEffect, useState, useMemo } from "react";
import { X } from "lucide-react";
import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import ServiceLogo from "@/assets/icons/services/ServiceLogo.svg";
import { SelectionProvider, useSelection } from "@/hooks/services/useSelection";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

// ----------------------------- CAR & SERVICE SELECTORS -----------------------------
function ServiceCardModalCarSelectors({ branchId }: { branchId: number }) {
  const { setSelections } = useSelection();

  const [brandOptions, setBrandOptions] = useState<
    { brand_id: number; brand_name: string }[]
  >([]);
  const [serviceOptions, setServiceOptions] = useState<
    { service_id: number; service_name: string }[]
  >([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");

  const triggerClassname =
    "border-soft-gray text-misty-gray text-sm italic font-medium";

  useEffect(() => {
    if (!branchId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/branch-catalog/brands`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId }),
          signal: controller.signal,
        });
        const data = await res.json();
        const brands = Array.isArray(data?.brands) ? data.brands : [];
        setBrandOptions(brands);
      } catch {
        setBrandOptions([]);
      }
    })();
    return () => controller.abort();
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !selectedBrandId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/branch-catalog/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            branch_id: branchId,
            brand_id: selectedBrandId,
          }),
          signal: controller.signal,
        });
        const data = await res.json();
        const services = Array.isArray(data?.services) ? data.services : [];
        setServiceOptions(services);
      } catch {
        setServiceOptions([]);
      }
    })();
    return () => controller.abort();
  }, [branchId, selectedBrandId]);

  return (
    <div className="w-full grid grid-cols-2 600:grid-cols-3 gap-6">
      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Car brand *</label>
        <CarSelector
          options={brandOptions}
          onChange={(value, label) => {
            const brandIdNum = Number(value);
            setSelectedBrandId(brandIdNum);
            setSelections((prev: any) => ({
              ...prev,
              selectedCar: value,
              selectedCarLabel: label,
            }));
          }}
          placeholder="Select the car brand"
          triggerClassname={triggerClassname}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Brand model *</label>
        <CarModelSelector
          brandId={selectedBrandId}
          value={selectedModel}
          onChange={(value, label) => {
            setSelectedModel(value);
            setSelections((prev: any) => ({
              ...prev,
              selectedModel: value,
              selectedModelLabel: label,
            }));
          }}
          placeholder="Select model"
          triggerClassname={triggerClassname}
        />
      </div>

      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Service *</label>
        <ServiceSelector
          options={serviceOptions}
          onChange={(value, label) =>
            setSelections((prev: any) => ({
              ...prev,
              selectedService: value,
              selectedServiceLabel: label,
            }))
          }
          placeholder="Select the service"
          triggerClassname={triggerClassname}
        />
      </div>
    </div>
  );
}

// ----------------------------- DATE SELECTOR -----------------------------
function ServiceCardModalDateSelector() {
  const { selections, setSelections } = useSelection();
  const today = new Date();
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    return {
      fullDate: format(d, "dd MMM yyyy"),
      iso: format(d, "yyyy-MM-dd"),
      chip: format(d, "dd MMM"),
    };
  });

  function setDay(display: string, iso: string) {
    setSelections((prev: any) => ({
      ...prev,
      selectedDay: display,
      selectedDateISO: iso,
    }));
  }

  useEffect(() => {
    setDay(next7Days[0].fullDate, next7Days[0].iso);
  }, []);

  return (
    <div className="flex flex-col gap-y-3">
      <h5 className="text-dark-gray text-sm font-medium">Reservation Date</h5>
      <div className="w-full grid grid-cols-3 450:grid-cols-5 570:grid-cols-7 gap-2 pr-4">
        {next7Days.map((day) => (
          <div
            key={day.iso}
            onClick={() => setDay(day.fullDate, day.iso)}
            className={cn(
              "flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray",
              day.fullDate === selections.selectedDay &&
                "text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold"
            )}
          >
            {day.chip}
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------------------- TIME SELECTOR (Enhanced: filters past times on current date) -----------------------------
function ServiceCardModalTimeSelector({ branchId }: { branchId: number }) {
  const { selections, setSelections } = useSelection();
  const [times, setTimes] = useState<string[]>([]);

  const fetchSlots = async (branchId: number, dateISO: string) => {
    try {
      const res = await fetch(`${BASE_URL}/api/reservations/available-slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branch_id: branchId,
          date: dateISO,
        }),
      });
      const data = await res.json();
      let slots: string[] = Array.isArray(data?.availableTimeSlots)
        ? data.availableTimeSlots
        : [];

      // filter out past times if current date
      const now = new Date();
      const todayISO = format(now, "yyyy-MM-dd");
      if (dateISO === todayISO) {
        const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
        slots = slots.filter((time) => {
          const [h, m] = time.split(":").map(Number);
          const slotMinutes = h * 60 + m;
          return slotMinutes > currentTimeMinutes;
        });
      }

      setTimes(slots);
      if (slots.length > 0) {
        setSelections((prev: any) => ({
          ...prev,
          selectedTime: slots[0],
        }));
      } else {
        setSelections((prev: any) => ({ ...prev, selectedTime: "" }));
      }
    } catch {
      setTimes([]);
      setSelections((prev: any) => ({ ...prev, selectedTime: "" }));
    }
  };

  useEffect(() => {
    if (!branchId) return;
    const dateISO =
      (selections as any).selectedDateISO || format(new Date(), "yyyy-MM-dd");
    fetchSlots(branchId, dateISO);
  }, [branchId, (selections as any).selectedDateISO]);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-dark-gray text-sm font-medium">Reservation time</h5>
      </div>
      <div className="grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2">
        {times.map((time) => (
          <div
            key={time}
            onClick={() =>
              setSelections((prev: any) => ({ ...prev, selectedTime: time }))
            }
            className={cn(
              "flex justify-center items-center cursor-pointer bg-white rounded-[8px] border-[1px] border-soft-gray p-2 text-sm font-medium text-slate-gray",
              time === (selections as any).selectedTime &&
                "text-steel-blue border-steel-blue bg-steel-blue/10 font-semibold"
            )}
          >
            {time}
          </div>
        ))}
        {times.length === 0 && (
          <div className="text-sm text-slate-gray">No available time slots.</div>
        )}
      </div>
    </div>
  );
}

// ----------------------------- STEP ONE -----------------------------
function ServiceCardModalStepOne({ branchId }: { branchId: number }) {
  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      <ServiceCardModalCarSelectors branchId={branchId} />
      <ServiceCardModalDateSelector />
      <ServiceCardModalTimeSelector branchId={branchId} />
    </div>
  );
}

// ----------------------------- STEP TWO -----------------------------
function ServiceCardModalStepTwo({ branchInfo }: { branchInfo: any }) {
  const { selections } = useSelection();
  const sel = selections as any;

  const coverSrc = useMemo(() => {
    const img = branchInfo?.branchCoverImg;
    if (!img) return ServiceLogo.src;
    if (String(img).startsWith("http")) return img;
    return `${BASE_URL}/images/${img}`;
  }, [branchInfo]);

  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      <div className="flex gap-4 items-center">
        <img className="size-14" src={coverSrc} />
        <div className="flex flex-col gap-y-0.5">
          <h4 className="text-xl text-charcoal font-semibold">
            {branchInfo?.branchName || "Performance Center"}
          </h4>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Date & Time:</h5>
          <span className="font-medium text-base text-charcoal">
            {sel.selectedDay}, {sel.selectedTime}
          </span>
        </div>

        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Car and Model:</h5>
          <span className="font-medium text-base text-charcoal">
            {sel.selectedCarLabel || "Car Brand"},{" "}
            {sel.selectedModelLabel || "Car Model"}
          </span>
        </div>

        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Service type:</h5>
          <span className="font-medium text-base text-charcoal">
            {sel.selectedServiceLabel || "Service Type"}
          </span>
        </div>

        <div className="flex gap-1">
          <h5 className="text-base text-charcoal/50">Service location:</h5>
          <span className="font-medium text-base text-charcoal">
            {`${branchInfo?.address || ""}${
              branchInfo?.city ? ", " + branchInfo.city : ""
            }`}
          </span>
        </div>
      </div>
    </div>
  );
}

// ----------------------------- MAIN MODAL -----------------------------
interface IServiceCardModal {
  selectedBranchId: number | null;
  closeModal: () => void;
}

function ServiceCardModal({ selectedBranchId, closeModal }: IServiceCardModal) {
  const [step, setStep] = useState(1);
  const [branchInfo, setBranchInfo] = useState<any>(null);

  const fetchBranchInfo = async (branchId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/branches/${branchId}`);
      const data = await res.json();
      setBranchInfo(data);
    } catch {
      setBranchInfo(null);
    }
  };

  const handleNext = async () => {
    if (step === 1 && selectedBranchId) {
      await fetchBranchInfo(selectedBranchId);
      setStep(2);
    }
  };

  return (
    <Dialog open={selectedBranchId !== null}>
      <DialogContent
        className={cn(
          "overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8"
        )}
      >
        <DialogHeader className="w-full flex justify-between items-center border-b-[1px] border-b-blue-gray p-8 pt-0">
          <DialogTitle className="p-0 m-0 text-2xl text-charcoal font-medium">
            {step === 1
              ? "Make the reservation"
              : "Confirm your reservation"}
          </DialogTitle>
          <DialogPrimitive.Close
            onClick={() => {
              closeModal();
              setTimeout(() => setStep(1), 300);
            }}
          >
            <X className="size-6 text-charcoal/50" />
          </DialogPrimitive.Close>
        </DialogHeader>

        <SelectionProvider>
          {step === 1 && selectedBranchId !== null && (
            <ServiceCardModalStepOne branchId={selectedBranchId} />
          )}
          {step === 2 && <ServiceCardModalStepTwo branchInfo={branchInfo} />}
        </SelectionProvider>

        <DialogFooter className="px-8">
          {step === 1 && (
            <Button
              onClick={handleNext}
              className="bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full"
            >
              Make reservation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ServiceCardModal);
