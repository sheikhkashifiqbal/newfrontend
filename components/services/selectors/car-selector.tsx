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
}: ICarSelector) {
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const [plateNumbers, setPlateNumbers] = useState<string[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081";

  // Fetch car brands
  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`)
      .then((res) => res.json())
      .then((data: CarBrand[]) => setCarBrands(data))
      .catch((err) => console.error("Failed to fetch brands", err));
  }, [BASE_URL]);

  // Fetch plate numbers on load
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
            // Keep values exactly as returned (may already include "p-")
            setPlateNumbers(data.plate_number);
          }
        })
        .catch((err) => console.error("Failed to fetch plates", err));
    } catch (e) {
      console.error("Error reading localStorage auth_response", e);
    }
  }, [BASE_URL]);

  return (
    <CustomSelect
      value={value}
      onChange={(v) => onChange && onChange(v)}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className="p-5 flex flex-col gap-y-3 car-sel-color">
        <SelectGroup>
          {showMyCars && <CustomSelectLabel>My Cars</CustomSelectLabel>}

          {/* Plate Numbers at Top */}
          {plateNumbers.length > 0 &&
            plateNumbers.map((plate, idx) => {
              const displayText = plate.startsWith("p-") ? plate.slice(2) : plate; // <-- show without "p-"
              return (
                <CustomSelectItem key={`plate-${idx}`} value={plate}>
                  {displayText}
                </CustomSelectItem>
              );
            })}

          {/* Separator if plates exist */}
          {plateNumbers.length > 0 && (
            <CustomSelectItem
              key="separator"
              value="separator"
              
              className="opacity-60 text-center text-sm"
            >
              -------
            </CustomSelectItem>
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
