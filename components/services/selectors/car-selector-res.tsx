'use client'
import CustomSelect, { CustomSelectItem, CustomSelectLabel } from "@/components/app-custom/custom-select";
import { SelectGroup } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";


const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL as string;


interface ICarSelector {
placeholder?: string;
triggerClassname?: string;
onChange?: (value: string) => void;
value?: string;
showMyCars?: boolean;
/** branch-catalog options override */
options?: { brand_id: number; brand_name: string }[];
}


interface CarBrand {
brandId: number;
brandName: string;
}


export function CarSelector({
placeholder = 'Select the car',
triggerClassname,
onChange,
value,
showMyCars = true,
options
}: ICarSelector) {
const [carBrands, setCarBrands] = useState<CarBrand[]>([]);


// If options are passed (branch-scoped), use them; else fetch global brands
useEffect(() => {
if (Array.isArray(options) && options.length > 0) {
setCarBrands(options.map(o => ({ brandId: o.brand_id, brandName: o.brand_name })));
return;
}
fetch(`${BASE_URL}/api/brands`)
.then((res) => res.json())
.then((data: CarBrand[]) => setCarBrands(data))
.catch(() => setCarBrands([]));
}, [options]);


return (
<CustomSelect
value={value}
onChange={(v) => onChange && onChange(v)}
triggerClassname={cn(triggerClassname)}
placeholder={placeholder}
>
<div className={'p-5 flex flex-col gap-y-3 car-sel-color'}>
<SelectGroup>
{showMyCars && <CustomSelectLabel>Car brands</CustomSelectLabel>}
{carBrands.map((brand) => (
<CustomSelectItem key={brand.brandId} value={brand.brandId.toString()}>
{brand.brandName}
</CustomSelectItem>
))}
</SelectGroup>
</div>
</CustomSelect>
);
}