import Container from "@/components/Container";
import { DatePicker } from "@/components/app-custom/date-pick";

import { CarSelector } from "@/components/services/selectors/car-selector";
import { CarModelSelector } from "@/components/services/selectors/car-model-selector";
import { ServiceSelector } from "@/components/services/selectors/service-selector";
import { CitySelector } from "@/components/services/selectors/city-selector";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns"; 

interface IServicesSelectors {
  onSearchClicked?: () => void;
  onSubmitSearch?: (payload: Record<string, unknown>) => void;
  selectedDateISO?: string; // ← sync from page (chip clicks)
}

type Option = { id: number; label: string };

export default function ServicesSelectors({ onSearchClicked, onSubmitSearch, selectedDateISO }: IServicesSelectors) {
  const [selectedBrand, setSelectedBrand] = useState<Option | null>(null);
  const [selectedModel, setSelectedModel] = useState<Option | null>(null);
  const [selectedService, setSelectedService] = useState<Option | null>(null);
  const [selectedCity, setSelectedCity] = useState<Option | null>(null);

  // Date state: Date for UI, ISO string for payload
  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 🔄 When a chip is clicked (parent updates selectedDateISO), show it in the DatePicker
  useEffect(() => {
    if (!selectedDateISO) return;
    setSelectedDate(selectedDateISO);
    try {
      setPickerDate(parseISO(selectedDateISO));
    } catch { /* ignore */ }
  }, [selectedDateISO]);

  const [coords] = useState<{ lat?: number; lon?: number }>({});
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleBrandChange = (value: string) => {
    if (!value) return setSelectedBrand(null);
    const id = Number(value);
    fetch(`${BASE_URL}/api/brands/${id}`)
      .then((r) => r.json())
      .then((b) => setSelectedBrand({ id, label: b.brandName }))
      .catch(() => setSelectedBrand({ id, label: String(id) }));
  };

  const handleModelChange = (value: string) => {
    if (!value) return setSelectedModel(null);
    const id = Number(value);
    fetch(`${BASE_URL}/api/brand-models/${id}`)
      .then((r) => r.json())
      .then((m) => setSelectedModel({ id, label: m.modelName }))
      .catch(() => setSelectedModel({ id, label: String(id) }));
  };

  const handleServiceChange = (value: string) => {
    if (!value) return setSelectedService(null);
    const id = Number(value);
    fetch(`${BASE_URL}/api/services/${id}`)
      .then((r) => r.json())
      .then((s) => setSelectedService({ id, label: s.serviceName }))
      .catch(() => setSelectedService({ id, label: String(id) }));
  };

  const handleCityChange = (value: string) => {
    if (!value) return setSelectedCity(null);
    const id = Number(value);
    fetch(`${BASE_URL}/api/cities/${id}`)
      .then((r) => r.json())
      .then((c) => setSelectedCity({ id, label: c.city }))
      .catch(() => setSelectedCity({ id, label: String(id) }));
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

  const buildPayload = async () => {
    const fresh = await getLocation();
    const currentLat = fresh.lat ?? coords.lat;
    const currentLon = fresh.lon ?? coords.lon;

    const raw: Record<string, unknown> = {
      carBrand: selectedBrand?.label || undefined,
      carModel: selectedModel?.label || undefined,
      serviceEntity: selectedService?.label || undefined,
      date: selectedDate || undefined, // ← reflects chip click OR popup pick
      location: selectedCity?.label || undefined,
      currentLon: typeof currentLon === "number" ? currentLon : undefined,
      currentLat: typeof currentLat === "number" ? currentLat : undefined,
    };

    const clean: Record<string, unknown> = {};
    Object.entries(raw).forEach(([k, v]) => {
      if (v !== null && v !== undefined && !(typeof v === "string" && v.trim() === "")) clean[k] = v;
    });

    console.log("Submitting payload:", clean);
    return clean;
  };

  const handleSearch = async () => {
    onSearchClicked && onSearchClicked();
    const payload = await buildPayload();
    onSubmitSearch && onSubmitSearch(payload);
  };

  return (
    <div className={"w-full bg-soft-blue py-14"}>
      <Container>
        <div className={"flex flex-col gap-y-10"}>
          <h1 className={"text-charcoal text-[2rem] leading-[3rem] font-semibold"}>
            Need Car Service? <br />
            Find Expert Workshops Near You Now!
          </h1>

          <div className={"w-full flex flex-col 450:flex-row gap-3"}>
            <div className={"grid gap-3 w-full grid-cols-1 450:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5"}>
              <CarSelector
                onChange={handleBrandChange}
                placeholder="Select brand"
                triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />
              <CarModelSelector
                brandId={selectedBrand?.id ?? null}
                onChange={handleModelChange}
                placeholder="Select model"
                triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />
              <ServiceSelector
                onChange={handleServiceChange}
                placeholder="Select service"
                triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />

              {/* DatePicker: past dates disabled, shows clicked chip date */}
              <DatePicker
                date={pickerDate}
                setDate={handleDatePicked}
                buttonClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />

              <CitySelector
                onChange={handleCityChange}
                placeholder="Select city"
                triggerClassname="border-soft-gray text-misty-gray text-sm italic font-medium"
              />
            </div>

            <CustomBlueBtn onClick={handleSearch} />
          </div>
        </div>
      </Container>
    </div>
  );
}
