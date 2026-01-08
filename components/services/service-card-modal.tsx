// =============================================
// File: components/services/service-card-modal.tsx
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
import { addDays, format } from "date-fns";
import { memo, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import ServiceLogo from "@/assets/icons/services/ServiceLogo.svg";
import { SelectionProvider, useSelection } from "@/hooks/services/useSelection";
import { toast } from "sonner";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

/* ----------------------------- Safe Toast ----------------------------- */
function useToastSafe() {
  return {
    toast: ({ description }: { description: string }) => {
      try {
        const anyWin = window as any;
        if (anyWin && typeof anyWin.toast === "function") {
          anyWin.toast(description);
        } else {
          alert(description);
        }
      } catch {}
    },
  };
}

/* ----------------------------- ADDED: Central 401 handler ----------------------------- */
/** When server returns 401 (expired/invalid JWT):
 *  1) POST /api/auth/logout
 *  2) Close the reservation modal
 *  3) Open login popup via global event
 */
async function handle401Unauthorized(closeModal: () => void) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    if (res.ok) {
      localStorage.clear();
      toast.success("Logged out successfully");
      window.location.href = "/"; // redirect to home after logout
    } else {
      toast.error("Logout failed");
    }
  } catch (err) {
    console.error("Logout error:", err);
    toast.error("Logout request failed");
  }
  closeModal();
  // ADDED: trigger re-login popup
  window.dispatchEvent(new CustomEvent("open-login-modal"));
}

/* ----------------------------- Car & Service Selectors ----------------------------- */
function ServiceCardModalCarSelectors({
  branchId,
  forceValidate,
  closeModal,
}: {
  branchId: number;
  forceValidate: boolean;
  closeModal: () => void;
}) {
  const { setSelections } = useSelection();

  const [brandOptions, setBrandOptions] = useState<
    { brand_id: number; brand_name: string }[]
  >([]);
  const [serviceOptions, setServiceOptions] = useState<
    { service_id: number; service_name: string }[]
  >([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedService, setSelectedService] = useState<string>("");

  const triggerClassname =
    "border-soft-gray text-misty-gray text-sm italic font-medium";

  // On modal open → load branch-scoped brands
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
        // ADDED: 401 handling
        if (res.status === 401) {
          await handle401Unauthorized(closeModal);
          return;
        }
        const data = await res.json();
        const brands = Array.isArray(data?.brands) ? data.brands : [];
        setBrandOptions(brands);
      } catch {
        setBrandOptions([]);
      }
    })();
    return () => controller.abort();
  }, [branchId, closeModal]);

  // When brand changes → load services for branch+brand
  useEffect(() => {
    if (!branchId || !selectedBrandId) return;
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/branch-catalog/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branch_id: branchId, brand_id: selectedBrandId }),
          signal: controller.signal,
        });
        // ADDED: 401 handling
        if (res.status === 401) {
          await handle401Unauthorized(closeModal);
          return;
        }
        const data = await res.json();
        const services = Array.isArray(data?.services) ? data.services : [];
        setServiceOptions(services);
      } catch {
        setServiceOptions([]);
      }
    })();
    return () => controller.abort();
  }, [branchId, selectedBrandId, closeModal]);

  // Persist to session
  const setSession = (k: string, v: string) => {
    try {
      sessionStorage.setItem(k, v);
    } catch {}
  };

  const brandMissing = forceValidate && !selectedBrandId;
  const modelMissing = forceValidate && !selectedModel;
  const serviceMissing = forceValidate && !selectedService;

  return (
    <div className="w-full grid grid-cols-2 600:grid-cols-3 gap-6">
      {/* Car brand */}
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
            setSession("brand_id", String(brandIdNum));
          }}
          placeholder="Select the car brand"
          triggerClassname={triggerClassname}
        />
        {brandMissing && (
          <span className="text-red-500 text-xs mt-1">
            Please select a car brand.
          </span>
        )}
      </div>

      {/* Brand model */}
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
            setSession("model_id", String(value));
            if (label) setSession("model_brand", label); // needed later to resolve car id
          }}
          placeholder="Select model"
          triggerClassname={triggerClassname}
        />
        {modelMissing && (
          <span className="text-red-500 text-xs mt-1">Please select a model.</span>
        )}
      </div>

      {/* Service */}
      <div className="flex flex-col gap-y-3">
        <label className="text-dark-gray text-sm font-medium">Service *</label>
        <ServiceSelector
          options={serviceOptions}
          onChange={(value, label) => {
            setSelectedService(value);
            setSelections((prev: any) => ({
              ...prev,
              selectedService: value,
              selectedServiceLabel: label,
            }));
            setSession("service_id", String(value));
          }}
          placeholder="Select the service"
          triggerClassname={triggerClassname}
        />
        {serviceMissing && (
          <span className="text-red-500 text-xs mt-1">
            Please select a service.
          </span>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Date Selector ----------------------------- */
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
    try {
      sessionStorage.setItem("reservationDate", iso);
    } catch {}
  }

  useEffect(() => {
    setDay(next7Days[0].fullDate, next7Days[0].iso); // today by default
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
              day.fullDate === (selections as any).selectedDay &&
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

/* ----------------------------- ADDED: Disable time slot type ----------------------------- */
type DisableTimeSlotRow = {
  disableTimeSlotId: number;
  branchId: number;
  serviceId: number | null;
  timeSlot: string;
};

/* ----------------------------- Time Selector ----------------------------- */
function ServiceCardModalTimeSelector({
  branchId,
  closeModal,
}: {
  branchId: number;
  closeModal: () => void;
}) {
  const { selections, setSelections } = useSelection();
  const [times, setTimes] = useState<string[]>([]);

  // NEW: store disabled time slots from GET /api/disable-time-slot-service
  const [disabledSlots, setDisabledSlots] = useState<DisableTimeSlotRow[]>([]);

  // 🔹 Fetch the disable-time-slot-service list once when popup/branch is active
  const fetchDisabledSlots = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/disable-time-slot-service`, {
        method: "GET",
      });

      // 401 handling
      if (res.status === 401) {
        await handle401Unauthorized(closeModal);
        return;
      }

      const data = await res.json();
      const rows = Array.isArray(data) ? data : [];

      const normalized: DisableTimeSlotRow[] = rows.map((d: any) => ({
        disableTimeSlotId:
          typeof d.disableTimeSlotId === "number"
            ? d.disableTimeSlotId
            : typeof d.id === "number"
            ? d.id
            : 0,
        branchId: Number(d.branchId),
        serviceId:
          d.serviceId === null || d.serviceId === undefined
            ? null
            : Number(d.serviceId),
        timeSlot: String(d.timeSlot),
      }));

      setDisabledSlots(normalized);
    } catch (e) {
      console.error("Failed to fetch disable-time-slot-service:", e);
      setDisabledSlots([]);
    }
  };

  const fetchSlots = async () => {
    if (!branchId) return;

    const dateISO =
      (selections as any).selectedDateISO || format(new Date(), "yyyy-MM-dd");

    const brandId = Number((selections as any).selectedCar);
    const modelId = Number((selections as any).selectedModel);
    const serviceId = Number((selections as any).selectedService);

    const allSelected = !!brandId && !!modelId && !!serviceId && !!dateISO;

    const payload: any = {
      branch_id: branchId,
      date: dateISO,
    };
    if (allSelected) {
      payload.brand_id = brandId;
      payload.model_id = modelId;
      payload.service_id = serviceId;
    }

    try {
      const authRaw = window.localStorage.getItem("auth_response");
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const token = auth?.token ?? null; // use the token string stored in auth_response.token

      if (!token) {
        throw new Error(
          "No auth token found in localStorage (auth_response.token)"
        );
      }
      console.log("token:::", token);
      const res = await fetch(`${BASE_URL}/api/reservations/available-slots`, {
        method: "POST",
      //  credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // correct header key and value format
        },
        body: JSON.stringify(payload),
      });

      // ADDED: 401 handling
      if (res.status === 401) {
        await handle401Unauthorized(closeModal);
        return;
      }
      const data = await res.json();

      let slots: string[] = Array.isArray(data?.availableTimeSlots)
        ? data.availableTimeSlots
        : [];

      // keep original UX: if date is today, hide past slots
      const todayISO = format(new Date(), "yyyy-MM-dd");
      if (dateISO === todayISO) {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        slots = slots.filter((t) => {
          const [h, m] = t.split(":").map(Number);
          const mins = h * 60 + (m || 0);
          return mins > currentMinutes;
        });
      }

      // 🔹 APPLY YOUR NEW DISABLE RULES (a) and (b)
      const selectedServiceId =
        Number((selections as any).selectedService) || null;

      // Consider only disabled rows for this branch
      const disabledForBranch = disabledSlots.filter(
        (row) => row.branchId === branchId
      );

      // Filter slots using both rules:
      // a) if row.serviceId is null AND timeSlot matches => remove (for ALL services)
      // b) if row.serviceId not null AND selected service == row.serviceId AND timeSlot matches => remove
      slots = slots.filter((time) => {
        const isDisabled = disabledForBranch.some((row) => {
          if (row.timeSlot !== time) return false;

          // Rule (a): disabled for ANY service
          if (row.serviceId === null) {
            return true;
          }

          // Rule (b): disabled only for specific service
          if (!selectedServiceId) {
            // no service selected yet -> rule (b) doesn't apply
            return false;
          }

          return row.serviceId === selectedServiceId;
        });

        return !isDisabled;
      });

      setTimes(slots);
      setSelections((prev: any) => ({
        ...prev,
        selectedTime: slots.length > 0 ? slots[0] : "",
      }));
      if (slots.length > 0) {
        try {
          sessionStorage.setItem("reservationTime", slots[0]);
        } catch {}
      } else {
        try {
          sessionStorage.setItem("reservationTime", "");
        } catch {}
      }
    } catch (e) {
      console.error("Failed to fetch available slots:", e);
      setTimes([]);
      setSelections((prev: any) => ({ ...prev, selectedTime: "" }));
      try {
        sessionStorage.setItem("reservationTime", "");
      } catch {}
    }
  };

  // Fetch disabled slots once per branch (when modal is active)
  useEffect(() => {
    if (!branchId) return;
    fetchDisabledSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId]);

  useEffect(() => {
    fetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    branchId,
    (selections as any).selectedDateISO,
    (selections as any).selectedCar,
    (selections as any).selectedModel,
    (selections as any).selectedService,
    disabledSlots, // re-filter when disabled rules arrive/change
  ]);

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <h5 className="text-dark-gray text-sm font-medium">Reservation time</h5>
      </div>

      <div className="grid grid-cols-3 500:grid-cols-5 lg:grid-cols-7 pr-4 gap-2">
        {times.map((time) => (
          <div
            key={time}
            onClick={() => {
              setSelections((prev: any) => ({ ...prev, selectedTime: time }));
              try {
                sessionStorage.setItem("reservationTime", time);
              } catch {}
            }}
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

/* ----------------------------- Step One ----------------------------- */
function ServiceCardModalStepOne({
  branchId,
  forceValidate,
  closeModal,
}: {
  branchId: number;
  forceValidate: boolean;
  closeModal: () => void;
}) {
  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      <ServiceCardModalCarSelectors
        branchId={branchId}
        forceValidate={forceValidate}
        closeModal={closeModal}
      />
      <ServiceCardModalDateSelector />
      <ServiceCardModalTimeSelector branchId={branchId} closeModal={closeModal} />
    </div>
  );
}

/* ----------------------------- Step Two (Review) ----------------------------- */
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

/* ----------------------------- Step Three (Result + Details) ----------------------------- */
function ServiceCardModalStepThree({
  onClose,
  success,
  message,
  branchInfo,
}: {
  onClose: () => void;
  success: boolean;
  message: string;
  branchInfo: any;
}) {
  const { selections } = useSelection();
  const sel = selections as any;

  return (
    <div className="w-full px-8 flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-2">
        <h4 className="text-xl text-charcoal font-semibold">
          {success
            ? "Your reservation has been created successfully."
            : "Your reservation could not be created."}
        </h4>
        <p className="text-charcoal/70">
          {message ||
            (success
              ? "You will receive a confirmation shortly."
              : "Please review your details and try again.")}
        </p>
      </div>

      {/* Echo details like Step Two (as per previous requirement) */}
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

      <div className="w-full">
        <Button
          type="button"
          onClick={onClose}
          className="bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );
}

/* ----------------------------- Main Modal ----------------------------- */
interface IServiceCardModal {
  selectedBranchId: number | null;
  closeModal: () => void;
}

function ServiceCardModal({ selectedBranchId, closeModal }: IServiceCardModal) {
  const [step, setStep] = useState(1);
  const [branchInfo, setBranchInfo] = useState<any>(null);
  const [forceValidate, setForceValidate] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string }>(
    {
      success: true,
      message: "",
    }
  );
  const { toast } = useToastSafe();

  // ADDED: Reset session ids + Check login each time modal opens
  useEffect(() => {
    if (selectedBranchId !== null && typeof window !== "undefined") {
      sessionStorage.setItem("brand_id", ""); // ADDED
      sessionStorage.setItem("model_id", ""); // ADDED
      sessionStorage.setItem("service_id", ""); // ADDED
      sessionStorage.setItem("reservationTime", "");
      const auth = window.localStorage.getItem("auth_response"); // ADDED
      if (!auth) {
        // ADDED
        closeModal(); // ADDED
        window.dispatchEvent(new CustomEvent("open-login-modal")); // ADDED
      }
    }
  }, [selectedBranchId, closeModal]);

  // Fetch branch details for Step 2/3
  const fetchBranchInfo = async (branchId: number) => {
    try {
      const res = await fetch(`${BASE_URL}/api/branches/${branchId}`);
      // ADDED: 401 handling
      if (res.status === 401) {
        await handle401Unauthorized(closeModal);
        return;
      }
      const data = await res.json();
      setBranchInfo(data);
    } catch {
      setBranchInfo(null);
    }
  };

  // Step 1 → Step 2 ("Make reservation") with validation
  const handleNext = async () => {
    if (step !== 1 || !selectedBranchId) return;

    const brandId = Number(sessionStorage.getItem("brand_id"));
    const modelId = Number(sessionStorage.getItem("model_id"));
    const serviceId = Number(sessionStorage.getItem("service_id"));
    const reservationTime = sessionStorage.getItem("reservationTime");
    const ok = !!brandId && !!modelId && !!serviceId;

    if (!ok || reservationTime == "") {
      setForceValidate(true);
      return;
    }
    if (
      reservationTime === null &&
      reservationTime === undefined &&
      reservationTime === ""
    ) {
      setForceValidate(true);
      return;
    }

    await fetchBranchInfo(selectedBranchId);
    setStep(2);
  };

  // Step 2 → Step 3 ("Confirm"): create reservation
  const handleConfirm = async () => {
    try {
      // Read user_id from localStorage.auth_response
      const authRaw = window.localStorage.getItem("auth_response");
      const auth = authRaw ? JSON.parse(authRaw) : null;
      const userId = Number(auth?.id);

      const brandId = Number(sessionStorage.getItem("brand_id"));
      const modelId = Number(sessionStorage.getItem("model_id"));
      const serviceId = Number(sessionStorage.getItem("service_id"));
      const dateISO =
        sessionStorage.getItem("reservationDate") ||
        format(new Date(), "yyyy-MM-dd");
      const time = sessionStorage.getItem("reservationTime") || "";

      const res2 = await fetch(`${BASE_URL}/api/reservations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          serviceId,
          brandId,
          modelId,
          reservationDate: dateISO,
          reservationTime: time,
          reservationStatus: "pending",
          // 🔹 NEW FIELD ADDED AS PER REQUIREMENT:
          // keep track of which branch the reservation is booked for
          branchId: selectedBranchId,
        }),
      });
      // ADDED: 401 handling
      if (res2.status === 401) {
        await handle401Unauthorized(closeModal);
        return;
      }

      if (!res2.ok) {
        setResult({ success: false, message: "Reservation failed." });
        setStep(3);
        return;
      }

      await res2.json();
      toast({ description: "Reservation created successfully." });
      setResult({ success: true, message: "" });
      setStep(3);
    } catch (e: any) {
      const msg =
        e?.message || "Failed to create reservation. Please try again.";
      setResult({ success: false, message: msg });
      toast({ description: msg });
      setStep(3);
    }
  };

  // Close modal
  const handleCloseAll = () => {
    closeModal();
    setTimeout(() => {
      setStep(1);
      setForceValidate(false);
      setBranchInfo(null);
      setResult({ success: true, message: "" });
    }, 300);
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
              : step === 2
              ? "Confirm your reservation"
              : "Reservation"}
          </DialogTitle>
          <DialogPrimitive.Close onClick={handleCloseAll}>
            <X className="size-6 text-charcoal/50" />
          </DialogPrimitive.Close>
        </DialogHeader>

        {/* Provider kept identical */}
        <SelectionProvider>
          {step === 1 && selectedBranchId !== null && (
            <ServiceCardModalStepOne
              branchId={selectedBranchId}
              forceValidate={forceValidate}
              closeModal={closeModal}
            />
          )}

          {step === 2 && <ServiceCardModalStepTwo branchInfo={branchInfo} />}

          {step === 3 && (
            <ServiceCardModalStepThree
              onClose={handleCloseAll}
              success={result.success}
              message={result.message}
              branchInfo={branchInfo}
            />
          )}
        </SelectionProvider>

        <DialogFooter className="px-8">
          {step === 1 && (
            <Button
              onClick={handleNext}
              className="bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full"
              type="button"
            >
              Make reservation
            </Button>
          )}
          {step === 2 && (
            <Button
              onClick={handleConfirm}
              className="bg-steel-blue rounded-[12px] py-3 px-6 text-white text-base font-medium w-full"
              type="button"
            >
              Confirm
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default memo(ServiceCardModal);
