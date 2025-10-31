// =============================================
// File: components/services/selectors/service-selector-res.tsx
// =============================================
'use client'
import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface IServiceSelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
  options?: { service_id: number; service_name: string }[];
}

interface Service {
  serviceId: number;
  serviceName: string;
}

export function ServiceSelector({
  placeholder = 'Select service',
  triggerClassname,
  onChange,
  value,
  options
}: IServiceSelector) {
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    if (Array.isArray(options) && options.length > 0) {
      setServices(options.map(s => ({ serviceId: s.service_id, serviceName: s.service_name })));
      return;
    }
    fetch(`${BASE_URL}/api/services`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data: Service[]) => setServices(data))
      .catch(() => setServices([]));
  }, [options]);

  return (
    <CustomSelect
      value={value}
      onChange={(v) => onChange && onChange(v)}
      triggerClassname={cn(triggerClassname)}
      placeholder={placeholder}
    >
      <div className={'p-5 flex flex-col gap-y-3'}>
        <SelectGroup>
          {services.map((service) => (
            <CustomSelectItem key={service.serviceId} value={service.serviceId.toString()}>
              {service.serviceName}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}