'use client'
import {SelectGroup} from "@/components/ui/select";
import CustomSelect, {CustomSelectItem} from "@/components/app-custom/custom-select";
import * as React from "react";
import {useState} from "react";
import {cn} from "@/lib/utils";

interface IDistanceSelector {
  placeholder?: string
  triggerClassname?: string
  onChange?: (value: string) => void
}

export default function DistanceSelector({
  placeholder = 'Select distance',
  triggerClassname,
  onChange
}: IDistanceSelector) {
  const values = [
	{ id: 0, value: 'DISTANCE_CLOSEST', text: 'Closest' },
    { id: 1, value: 'DISTANCE_FARTHEST', text: 'Farthest' }
  ];
  const [value,setValue] = useState<string | undefined>(values[0].value);
  return (
    <CustomSelect
      value={value}
      onChange={(v) => { setValue(v); onChange?.(v); console.log("v:::", v);}}
      triggerClassname={cn('bg-soft-gray text-sm font-medium text-dark-gray', triggerClassname)}
      placeholder={placeholder}
    >
      <div className={'p-5 flex flex-col gap-y-3'}>
        <SelectGroup>
          {values.map((C) => (
            <CustomSelectItem key={C.id} value={C.value}>
              {C.text}
            </CustomSelectItem>
          ))}
        </SelectGroup>
      </div>
    </CustomSelect>
  );
}
