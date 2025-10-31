// =============================================
// File: components/services/selectors/car-model-selector-res.tsx
// =============================================
'use client'
import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface ICarModelSelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
  brandId: number | null;
  options?: { model_id: number; model_name: string }[];
}

interface CarBrandModel {
  id: number;
  brandId?: number;
  modelName: string;
}

export function CarModelSelector({
  placeholder = 'Car model',
  triggerClassname,
  onChange,
  value,
  brandId,
  options
}: ICarModelSelector) {
  const [models, setModels] = useState<CarBrandModel[]>([]);

  useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setModels(options.map(m => ({ id: m.model_id, modelName: m.model_name })));
      return;
    }

    if (!brandId) {
      setModels([]);
      return;
    }

    fetch(`${BASE_URL}/api/brand-models/by-brand/${brandId}`)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch brand models");
        return response.json();
      })
      .then((data: CarBrandModel[]) => setModels(data))
      .catch(() => setModels([]));
  }, [brandId, options]);

  return (
    <CustomSelect
      value={value}
      onChange={(v) => onChange && onChange(v)}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className={'p-5 flex flex-col gap-y-3'}>
        <SelectGroup>
          {models.map((model) => (
            <CustomSelectItem key={model.id} value={model.id.toString()}>
              {model.modelName}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}
