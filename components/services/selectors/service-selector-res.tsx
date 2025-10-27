import CustomSelect, { CustomSelectItem } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface IServiceSelector {
  placeholder?: string;
  triggerClassname?: string;
  onChange?: (value: string) => void;
  value?: string;
}

interface Service {
  serviceId: number;
  serviceName: string;
}

export function ServiceSelector({
  placeholder = 'Select service',
  triggerClassname,
  onChange,
  value
}: IServiceSelector) {
  const [services, setServices] = useState<Service[]>([]);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetch(`${BASE_URL}/api/services`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch services");
        return res.json();
      })
      .then((data: Service[]) => setServices(data))
      .catch((err) => {
        console.error("Error fetching services:", err);
        setServices([]);
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
