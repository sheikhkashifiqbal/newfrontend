import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ICitySelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
}

interface City {
  id: number;
  city: string;
}

export function CitySelector({
  placeholder = 'Select city',
  triggerClassname,
  onChange,
  value
}: ICitySelector) {
  const [cities, setCities] = useState<City[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/api/cities`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch cities");
        return res.json();
      })
      .then((data: City[]) => setCities(data))
      .catch(err => {
        console.error("Error fetching cities:", err);
        setCities([]);
      });
  }, []);

  return (
    <CustomSelect
      value={value}
      onChange={(value) => onChange && onChange(value)}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className={'p-5 flex flex-col gap-y-3'}>
        <SelectGroup>
          {cities.map((city) => (
            <CustomSelectItem key={city.id} value={city.id.toString()}>
              {city.city}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}
