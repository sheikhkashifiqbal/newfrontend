'use client'
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
  placeholder = 'Select the car',
  triggerClassname,
  onChange,
  value,
  showMyCars = true
}: ICarSelector) {
  const mycars = [
    { id: 0, value: '10-bb-100', text: '10-BB-100' },

  ];

  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/api/brands`)
      .then((res) => res.json())
      .then((data: CarBrand[]) => setCarBrands(data))
      .catch((err) => console.error("Failed to fetch brands", err));
  }, []);

  return (
    <CustomSelect
      value={value}
      onChange={(value) => onChange && onChange(value)}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div  className={'p-5 flex flex-col gap-y-3 car-sel-color'}>
        
        <SelectGroup>
          {showMyCars && <CustomSelectLabel>Car brands</CustomSelectLabel>}
          {carBrands.map((brand) => (
            <CustomSelectItem  key={brand.brandId} value={brand.brandId.toString()}>
              {brand.brandName}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}
