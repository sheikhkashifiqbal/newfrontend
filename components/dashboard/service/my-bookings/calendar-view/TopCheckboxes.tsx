'use client'


import DashboardContainer from "@/components/dashboard/DashboardContainer";
import { CustomSwitch } from "@/components/app-custom/custom-switch";
import SmallNumBadge from "@/components/app-custom/small-num-badge";
import { useEffect, useState } from "react";

export interface ITopServiceItem {
  label: string;
  active: boolean;
  number: number;
}

interface ITopCheckboxesProps {
  initialServices?: ITopServiceItem[];
  onChange?: (services: ITopServiceItem[]) => void;
}

const defaultServices: ITopServiceItem[] = [
  {
    label: 'All services',
    active: true,
    number: 300,
  },
  {
    label: 'Engine',
    active: true,
    number: 10,
  },
  {
    label: 'Battery',
    active: true,
    number: 100,
  },
  {
    label: 'Tire',
    active: true,
    number: 24,
  },
  {
    label: 'Electronics',
    active: true,
    number: 100,
  },
  {
    label: 'Brake',
    active: true,
    number: 66,
  }
];

export default function TopCheckboxes({ initialServices, onChange }: ITopCheckboxesProps) {
  const [services, setServices] = useState<ITopServiceItem[]>(initialServices ?? defaultServices);

  // When parent sends new initialServices (after API load), sync local state
  useEffect(() => {
    if (initialServices && initialServices.length > 0) {
      setServices(initialServices);
    }
  }, [JSON.stringify(initialServices)]);

  // Notify parent AFTER services state changes (avoids setState during child render)
  useEffect(() => {
    if (onChange) {
      onChange(services);
    }
  }, [services, onChange]);

  const handleChange = (service: ITopServiceItem, checked: boolean) => {
    setServices((prev) => {
      const updated = prev.map((s) => {
        let isActive = s.active;

        // All services logic
        if (service.label === "All services") {
          isActive = checked;
        } else {
          if (s.label === "All services") {
            if (!checked) {
              isActive = false;
            } else {
              const currentCheckedServices = prev.filter((s2) => s2.active && s2.label !== "All services");
              if (currentCheckedServices.length === prev.length - 2) {
                isActive = true;
              }
            }
          }
        }

        // Switch only specific service
        if (s.label === service.label) {
          isActive = checked;
        }

        return {
          ...s,
          active: isActive
        }
      });

      return updated;
    });
  };

  return (
    <div className={'border-b border-b-soft-gray'}>
      <DashboardContainer>
        <div className={'flex gap-x-6 gap-y-1 flex-wrap'}>
          {services.map((service) => {
            return (
              <div
                className={'flex items-center gap-3 py-2 min-w-[12rem]'}
                key={service.label}
              >
                <CustomSwitch
                  onChecked={(checked) => handleChange(service, checked)}
                  checked={service.active}
                  label={service.label}
                  id={service.label}
                />

                <SmallNumBadge active={service.active} num={service.number} />
              </div>
            )
          })}
        </div>
      </DashboardContainer>
    </div>
  )
}
