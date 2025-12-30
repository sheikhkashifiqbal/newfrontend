'use client';
import CustomSelect, { CustomSelectItem, CustomSelectLabel } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ICarSelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
  showMyCars?: boolean;
  /** Notify parent when a plate resolves to brand/model */
  onBrandModelFetched?: (brandId: number, modelId: number | null) => void;
}

interface CarBrand {
  brandId: number;
  brandName: string;
}

export function CarSelector({
  placeholder = "Select the car",
  triggerClassname,
  onChange,
  value,
  showMyCars = true,
  onBrandModelFetched,
}: ICarSelector) {
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [plateNumbers, setPlateNumbers] = useState<string[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch car brands
  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`)
      .then((res) => res.json())
      .then((data: CarBrand[]) => setCarBrands(data))
      .catch((err) => console.error("Failed to fetch brands", err));
  }, [BASE_URL]);

  // Fetch user's plate numbers on load
  useEffect(() => {
    try {
      const authResponse = localStorage.getItem("auth_response");
      if (!authResponse) return;
      const parsed = JSON.parse(authResponse);
      const userId = parsed?.id;
      if (!userId) return;

      fetch(`${BASE_URL}/api/cars/plates-by-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.plate_number)) {
            // Keep the raw values (may already include "p-"); we show label without "p-"
            setPlateNumbers(data.plate_number);
          }
        })
        .catch((err) => console.error("Failed to fetch plates", err));
    } catch (e) {
      console.error("Error reading localStorage auth_response", e);
    }
  }, [BASE_URL]);

  const handleSelect = async (v: string) => {
    onChange?.(v);

    // If a plate was chosen (value begins with "p-"), resolve brand/model by plate
    if (v.startsWith("p-")) {
      const plate = v.slice(2);
      try {
        const res = await fetch(`${BASE_URL}/api/cars/brand-model-by-plate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plate_number: plate }),
        });
        if (!res.ok) throw new Error("Failed to fetch brand/model by plate");
        const data = await res.json();
        const brandId: number | undefined = data?.brand?.brand_id;
        const modelId: number | null = (data?.model?.model_id as number | undefined) ?? null;
        if (brandId) onBrandModelFetched?.(brandId, modelId);
      } catch (err) {
        console.error("Error fetching brand/model by plate:", err);
      }
    }
  };

  return (
    <CustomSelect
      value={value}
      onChange={handleSelect}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className="p-5 flex flex-col gap-y-3 car-sel-color">
        <SelectGroup>
          {showMyCars && <CustomSelectLabel>My Cars</CustomSelectLabel>}

          {/* Plates first (label shown without "p-", value stays as-is) */}
          {plateNumbers.length > 0 &&
            plateNumbers.map((plate, idx) => {
              const displayText = plate.startsWith("p-") ? plate.slice(2) : plate;
              return (
                <CustomSelectItem key={`plate-${idx}`} value={plate}>
                  {displayText}
                </CustomSelectItem>
              );
            })}

          {/* Separator (simple non-interactive line) */}
          {plateNumbers.length > 0 && (
            <div className="opacity-60 text-center text-sm select-none cursor-default pointer-events-none">
              -------
            </div>
          )}

          {/* Car Brands */}
          {showMyCars && <CustomSelectLabel>Car brands</CustomSelectLabel>}
          {carBrands.map((brand) => (
            <CustomSelectItem key={brand.brandId} value={brand.brandId.toString()}>
              {brand.brandName}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}
