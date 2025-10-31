// =============================================
// File: components/services/selectors/service-selector-res.tsx
// =============================================
'use client'
import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;

interface IServiceSelector {
  placeholder?: string;
  triggerClassname?: string;
  // allow optional label as 2nd arg
  onChange?: (value: string, label?: string) => void;
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

  // Map value -> label so we can pass label along
  const labelMap = useMemo(() => {
    const m = new Map<string, string>();
    services.forEach(s => m.set(String(s.serviceId), s.serviceName));
    return m;
  }, [services]);

  return (
    <CustomSelect
      value={value}
      onChange={(v) => {
        const label = labelMap.get(String(v)) || "";
        onChange && onChange(v, label);
      }}
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
