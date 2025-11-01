'use client'
import CustomSelect, { CustomSelectItem, CustomSelectLabel } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";

interface ICarSelector {
  placeholder?: string;
  triggerClassname?: string;
  // allow optional label as 2nd arg for compatibility with modal
  onChange?: (value: string, label?: string) => void;
  value?: string;
  /** branch-scoped list coming from POST /api/branch-catalog/brands */
  options?: { brand_id: number; brand_name: string }[];
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
  options = []
}: ICarSelector) {
  const [carBrands, setCarBrands] = useState<CarBrand[]>([]);

  // IMPORTANT: do NOT fetch /api/brands anymore.
  // Only use the branch-scoped `options` provided by the modal.
  useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setCarBrands(options.map(o => ({ brandId: o.brand_id, brandName: o.brand_name })));
    } else {
      setCarBrands([]);
    }
  }, [options]);

  // Map value -> label so we can pass label along
  const labelMap = useMemo(() => {
    const m = new Map<string, string>();
    carBrands.forEach(b => m.set(String(b.brandId), b.brandName));
    return m;
  }, [carBrands]);

  return (
    <CustomSelect
      value={value}
      onChange={(v) => {
        const label = labelMap.get(String(v)) || "";
        // Session requirement: store brand_id
        try { sessionStorage.setItem('brand_id', String(v)); } catch {}
        onChange && onChange(v, label);
      }}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className={'p-5 flex flex-col gap-y-3 car-sel-color'}>
        <SelectGroup>
          <CustomSelectLabel>Car brands</CustomSelectLabel>
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
