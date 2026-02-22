'use client'

import { useEffect, useMemo, useState } from "react"; // ⬅️ ADDED
import CustomMultiSelect, {ICustomMultiSelect} from "@/components/app-custom/custom-multi-select";

type  BrandsMultiSelector = Omit<ICustomMultiSelect, 'placeholder' | 'data'>

// data?:  {value: string, label: string}[]

export default function BrandsMultiSelector(
  {
    onChange,
    className,
    value
  }:  BrandsMultiSelector
) {
  // ===== ADDED: state to hold API brands =====
  const [apiBrands, setApiBrands] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ===== KEEP: your existing fallback data (not removed) =====
  const data = [    { value: "",      label: "" } ]

  // ===== ADDED: helper to create safe values from labels =====
  function toValue(str: string) {
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }

  // ===== ADDED: fetch brands from REST API on mount =====
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const res = await fetch(`${BASE_URL}/api/brands`);
        if (!res.ok) throw new Error(`Brands fetch failed: ${res.status}`);
        const json = await res.json();

        // Map to { value, label }
        // Accepts shapes like [{ brandName: "Toyota" }] or [{ name: "Toyota" }] or ["Toyota", ...]
        const mapped: { value: string; label: string }[] = Array.isArray(json)
          ? json.map((item: any) => {
			
              const label = (item?.brandName ?? item?.name ?? item) as string;
              const safeLabel = String(label);
              return { value: toValue(item.brandId), label: safeLabel };
            })
          : [];
			
        if (alive && mapped.length) setApiBrands(mapped);
      } catch (err: any) {
        if (alive) setLoadError(err?.message || "Failed to load brands");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ===== ADDED: prefer API data if available; otherwise use fallback =====
  const dataToUse = useMemo(
    () => (apiBrands.length ? apiBrands : data),
    [apiBrands, data]
  );

  // You can surface loading/error in the placeholder text
  const placeholder = loadError
    ? `Failed to load brands — using defaults`
    : (loading ? "Loading brands..." : "Select the brand or brands");

  return (
    <CustomMultiSelect
      value={value}
      className={className}
      data={dataToUse}
      onChange={onChange}
      placeholder={placeholder}
    />
  )
}
