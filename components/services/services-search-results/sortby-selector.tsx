'use client'
import {SelectGroup} from "@/components/ui/select";
import CustomSelect, {CustomSelectItem} from "@/components/app-custom/custom-select";
import * as React from "react";
import {useState} from "react";
import {cn} from "@/lib/utils";

interface ISortbySelector {
  placeholder?: string
  triggerClassname?: string
  onChange?: (value: string) => void
}

export default function SortbySelector({
  placeholder = 'Select sort by',
  triggerClassname,
  onChange
}: ISortbySelector) {
  const values = [
	{ id: 1, value: 'RATING_HIGH_TO_LOW', text: 'Rating Hight To Low' },
	{ id: 0, value: 'RATING_LOW_TO_HIGH', text: 'Rating Low To High' }
    
	
  ];
  const [value,setValue] = useState<string | undefined>(values[0].value);
  return (
    <CustomSelect
      value={value}
      triggerClassname={cn('bg-soft-gray text-sm font-medium text-dark-gray', triggerClassname)}
      placeholder={placeholder}
      onChange={(v) => { setValue(v); onChange?.(v); }}
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
