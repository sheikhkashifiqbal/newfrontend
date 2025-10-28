'use client';
import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ICarModelSelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
  brandId: number | null;
  /** NEW: model id to auto-select after models load */
  autoSelectModelId?: number | null;
}

interface CarBrandModel {
  id: number;
  brandId: number;
  modelName: string;
}

export function CarModelSelector({
  placeholder = 'Car model',
  triggerClassname,
  onChange,
  value,
  brandId,
  autoSelectModelId
}: ICarModelSelector) {
  const [models, setModels] = useState<CarBrandModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(value);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (brandId === null) {
      setModels([]);
      setSelectedModel(undefined);
      return;
    }
    const url = `${BASE_URL}/api/brand-models/by-brand/${brandId}`;
    fetch(url)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch brand models");
        return response.json();
      })
      .then((data: CarBrandModel[]) => {
        setModels(data || []);
        // Auto-select if provided
        if (autoSelectModelId) {
          const match = (data || []).find(m => m.id === autoSelectModelId);
          if (match) {
            setSelectedModel(match.id.toString());
            onChange?.(match.id.toString());
          }
        }
      })
      .catch(error => {
        console.error("Error fetching car models:", error);
        setModels([]);
      });
  }, [brandId, autoSelectModelId]);

  return (
    <CustomSelect
      value={selectedModel}
      onChange={(val) => {
        setSelectedModel(val);
        onChange?.(val);
      }}
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
