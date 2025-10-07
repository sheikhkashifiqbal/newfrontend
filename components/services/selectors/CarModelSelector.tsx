// CarModelSelector.tsx
import React from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface SelectorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  triggerClassname?: string;
  options: { label: string; value: string }[];
}

const CarModelSelector: React.FC<SelectorProps> = ({ value, onChange, placeholder, triggerClassname, options }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={triggerClassname}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export { CarModelSelector };
