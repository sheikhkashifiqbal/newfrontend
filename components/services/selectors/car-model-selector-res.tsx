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
  brandId
}: ICarModelSelector) {
  const [models, setModels] = useState<CarBrandModel[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    if (brandId === null) {
      setModels([]);
      return;
    }
	console.log("brandId::", brandId);
	if(brandId)
	{
    fetch(`${BASE_URL}/api/brand-models/by-brand/${brandId}`)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch brand models");
        return response.json();
      })
      .then((data: CarBrandModel[]) => setModels(data))
      .catch(error => {
        console.error("Error fetching car models:", error);
        setModels([]);
      });
	} else {
		fetch(`${BASE_URL}/api/brand-models`)
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch brand models");
        return response.json();
      })
      .then((data: CarBrandModel[]) => setModels(data))
      .catch(error => {
        console.error("Error fetching car models:", error);
        setModels([]);
      });

	}

  }, [brandId]);

  return (
    <CustomSelect
      value={value}
      onChange={(value) => onChange && onChange(value)}
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
