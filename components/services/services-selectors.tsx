'use client';
import Container from "@/components/Container";
import { DatePicker } from "@/components/app-custom/date-pick";
import { CarSelector } from "@/components/services/selectors/car-selector";
import { CarModelSelector } from "@/components/services/selectors/car-model-selector";
import { ServiceSelector } from "@/components/services/selectors/service-selector";
import { CitySelector } from "@/components/services/selectors/city-selector";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { useCallback, useEffect, useRef, useState } from "react";
import { format, parseISO } from "date-fns";

interface IServicesSelectors {
  onSearchClicked?: () => void;
  onSubmitSearch?: (payload: Record<string, unknown>) => void;
  selectedDateISO?: string;
}

type Option = { id: number; label: string };

export default function ServicesSelectors({
  onSearchClicked,
  onSubmitSearch,
  selectedDateISO,
}: IServicesSelectors) {
  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
  const [selectedModel, setSelectedModel] = useState<Option | null>(null);
  const [selectedService, setSelectedService] = useState<Option | null>(null);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);

  const [pickerDate, setPickerDate] = useState<Date | undefined>();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Controls the value displayed in CarSelector; lets us switch from plate -> brand option
  const [carSelectorValue, setCarSelectorValue] = useState<string | undefined>(undefined);

  // When brand is detected from a plate, we also want to auto-select model after models load
  const [autoModelId, setAutoModelId] = useState<number | null>(null);

  const errorRefs = {
    brand: useRef<HTMLDivElement | null>(null),
    model: useRef<HTMLDivElement | null>(null),
    service: useRef<HTMLDivElement | null>(null),
    city: useRef<HTMLDivElement | null>(null),
  };

  useEffect(() => {
    if (!selectedDateISO) return;
    setSelectedDate(selectedDateISO);
    try {
      setPickerDate(parseISO(selectedDateISO));
    } catch {}
  }, [selectedDateISO]);

  const [coords] = useState<{ lat?: number; lon?: number }>({});
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleBrandChange = (value: string) => {
    // If user manually selected a brand (not a plate), commit it
    if (!value.startsWith("p-")) {
      setSelectedBrand(value ? { id: Number(value), label: value } : null);
      setAutoModelId(null);
      setCarSelectorValue(value || undefined);
    } else {
      // If they chose a plate, keep value for a moment; CarSelector will callback with brand/model
      setCarSelectorValue(value);
    }
    setErrors((p) => ({ ...p, brand: "" }));
  };

  const handleBrandModelFetched = (brandId: number, modelId: number | null) => {
    // Show the brand option as selected inside CarSelector
    setCarSelectorValue(String(brandId));
    // Keep internal brand state in sync
    setSelectedBrand({ id: brandId, label: String(brandId) });
    // Ask CarModelSelector to auto-pick this model after it fetches
    setAutoModelId(modelId ?? null);
    // Clear brand error
    setErrors((p) => ({ ...p, brand: "" }));
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value ? { id: Number(value), label: value } : null);
    setErrors((p) => ({ ...p, model: "" }));
  };
  const handleServiceChange = (value: string) => {
    setSelectedService(value ? { id: Number(value), label: value } : null);
    setErrors((p) => ({ ...p, service: "" }));
  };
  const handleCityChange = (value: string) => {
    setSelectedCity(value ? { id: Number(value), label: value } : null);
    setErrors((p) => ({ ...p, city: "" }));
  };

  const handleDatePicked = useCallback((d?: Date) => {
    setPickerDate(d);
    setSelectedDate(d ? format(d, "yyyy-MM-dd") : null);
  }, []);

  const getLocation = async () =>
    new Promise<{ lat?: number; lon?: number }>((resolve) => {
      if (!navigator.geolocation) return resolve({});
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            lat: Number(pos.coords.latitude.toFixed(6)),
            lon: Number(pos.coords.longitude.toFixed(6)),
          }),
        () => resolve({}),
        { enableHighAccuracy: true, timeout: 8000 }
      );
    });

  const validateRequired = () => {
    const e: any = {};
    if (!selectedBrand?.id) e.brand = "Please select a car brand";
    if (!selectedModel?.id) e.model = "Please select a car model";
    if (!selectedService?.id) e.service = "Please select a service";
    if (!selectedCity?.id) e.city = "Please select a city";
    setErrors(e);
    const firstKey = Object.keys(e)[0];
    if (firstKey && errorRefs[firstKey as keyof typeof errorRefs].current)
      errorRefs[firstKey as keyof typeof errorRefs].current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    return Object.keys(e).length === 0;
  };

  const buildPayload = async () => {
    const fresh = await getLocation();
    const currentLat = fresh.lat ?? coords.lat;
    const currentLon = fresh.lon ?? coords.lon;
    const raw: Record<string, unknown> = {
      carBrand: selectedBrand?.label,
      carModel: selectedModel?.label,
      serviceEntity: selectedService?.label,
      date: selectedDate || undefined,
      location: selectedCity?.label,
      currentLon,
      currentLat,
    };
    const clean: Record<string, unknown> = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== null && v !== undefined && !(typeof v === "string" && v.trim() === "")) clean[k] = v;
    });
    return clean;
  };

  const handleSearch = async () => {
    if (!validateRequired()) return;
    onSearchClicked?.();
    const payload = await buildPayload();
    onSubmitSearch?.(payload);
  };

  return (
    <div className="w-full bg-soft-blue py-14">
      <Container>
        <div className="flex flex-col gap-y-10">
          <h1 className="text-charcoal text-[2rem] leading-[3rem] font-semibold">
            Need Car Service? <br /> Find Expert Workshops Near You Now!
          </h1>

          <div className="w-full flex flex-col 450:flex-row gap-3">
            <div className="grid gap-3 w-full grid-cols-1 450:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5">
              {/* Brand / Plate */}
              <div ref={errorRefs.brand}>
                <CarSelector
                  value={carSelectorValue}
                  onChange={handleBrandChange}
                  onBrandModelFetched={handleBrandModelFetched}
                  placeholder="Select brand or plate"
                  triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
                />
                {errors.brand && (
                  <p className="text-red-500 text-xs mt-1 opacity-100 transition-opacity duration-300 ease-in-out">
                    {errors.brand}
                  </p>
                )}
              </div>

              {/* Model (auto-select via autoModelId after brand models load) */}
              <div ref={errorRefs.model}>
                <CarModelSelector
                  brandId={selectedBrand?.id ?? null}
                  autoSelectModelId={autoModelId ?? undefined}
                  onChange={handleModelChange}
                  placeholder="Select model"
                  triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
                />
                {errors.model && (
                  <p className="text-red-500 text-xs mt-1 opacity-100 transition-opacity duration-300 ease-in-out">
                    {errors.model}
                  </p>
                )}
              </div>

              {/* Service */}
              <div ref={errorRefs.service}>
                <ServiceSelector
                  onChange={handleServiceChange}
                  placeholder="Select service"
                  triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
                />
                {errors.service && (
                  <p className="text-red-500 text-xs mt-1 opacity-100 transition-opacity duration-300 ease-in-out">
                    {errors.service}
                  </p>
                )}
              </div>

              {/* Date (already defaults to today) */}
              <DatePicker
                date={pickerDate}
                setDate={handleDatePicked}
                buttonClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />

              {/* City */}
              <div ref={errorRefs.city}>
                <CitySelector
                  onChange={handleCityChange}
                  placeholder="Select city"
                  triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
                />
                {errors.city && (
                  <p className="text-red-500 text-xs mt-1 opacity-100 transition-opacity duration-300 ease-in-out">
                    {errors.city}
                  </p>
                )}
              </div>
            </div>

            <CustomBlueBtn onClick={handleSearch} />
          </div>
        </div>
      </Container>
    </div>
  );
}
