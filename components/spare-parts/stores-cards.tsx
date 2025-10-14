'use client'
import * as React from "react";
import { useEffect, useState } from "react";
import { CardHeader } from "@/components/services/store-center-card";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// ---------- Types ----------
type BranchSparePartItem = {
  brandNames?: string[];
  stars: number;
  branchCoverImg: string;
  logoImg: string;
  branch_name: string;
};

// ---------- PopularCarBrands ----------
function PopularCarBrands({ brands }: { brands: string[] }) {
  const safeBrands = Array.isArray(brands) ? brands : [];
  return (
    <div className={'p-8 pt-0 flex flex-col gap-y-3'}>
      <p className={'text-sm font-medium text-muted-gray'}>Popular car brands</p>
      <div className={'flex flex-wrap gap-1'}>
        {safeBrands.map((b) => (
          <div
            key={b}
            className={'py-1.5 px-4 rounded-[52px] border-[1px] border-soft-gray text-base text-charcoal font-medium w-fit'}
          >
            {b}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- SingleStoreCard ----------
function SingleStoreCard({
  branch_name,
  logoImg,
  stars,
  branchCoverImg,
  brandNames,
}: BranchSparePartItem) {
  // Defensive: do not render if brandNames missing or empty/blank
  const hasBrands =
    Array.isArray(brandNames) && brandNames.some(b => b && String(b).trim() !== '');

  if (!hasBrands) return null;

  return (
    <div className={'flex flex-col max-w-[392px] max-h-[524px] overflow-hidden rounded-3xl bg-white'}>
      {/* Dynamic branch cover image */}
      <img
        className={'rounded-t-3xl max-h-[160px] object-cover w-full'}
        src={`${BASE_URL}/images/${branchCoverImg}`}
        alt={`${branch_name} cover`}
      />
      <div className={'flex flex-col gap-6'}>
        {/* Dynamic CardHeader (logo, stars, branch name) */}
        <CardHeader containerClassname={'p-8 pb-0'} branchName={branch_name} logoImg={logoImg} stars={stars} />
        {/* Dynamic PopularCarBrands (brandNames) */}
        <PopularCarBrands brands={brandNames!} />
      </div>
    </div>
  );
}

// ---------- Parent: StoresCards ----------
export default function StoresCards() {
  const [data, setData] = useState<BranchSparePartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/branches/brand-spareparts`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: BranchSparePartItem[] = await res.json();

        // ✅ Keep only items where brandNames exists and has at least one non-empty string
        const sanitized = (Array.isArray(json) ? json : []).filter(
          (it) => Array.isArray(it.brandNames) && it.brandNames.some(b => b && String(b).trim() !== '')
        );

        if (isMounted) setData(sanitized);
      } catch (err: any) {
        if (isMounted) setError(err?.message ?? 'Failed to load data');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <div className="py-5">Loading spare part suppliers…</div>;
  if (error) return <div className="py-5 text-red-600">Error: {error}</div>;

  return (
    <div className={'flex flex-col gap-y-8'}>
      <h1 className={'text-charcoal text-[2rem] leading-[3rem] font-semibold'}>
        Reliable Car Spare Part Suppliers You Can Trust!
      </h1>
      <p className={'text-base text-charcoal max-w-[80ch]'}>
        Discover seamless car maintenance with our trusted suppliers. From quality spare parts to performance upgrades, our platform connects you with certified professionals for genuine and reliable components.
      </p>

      <div className={'py-5 grid grid-cols-1 600:grid-cols-2 mx-0 xl:grid-cols-3 1650:grid-cols-4 2060:grid-cols-5 gap-x-5 gap-y-6'}>
        {data.map((item, index) => (
          <SingleStoreCard
            key={`${item.branch_name}-${index}`}
            branch_name={item.branch_name}
            logoImg={item.logoImg}
            stars={item.stars}
            branchCoverImg={item.branchCoverImg}
            brandNames={item.brandNames}
          />
        ))}
      </div>
    </div>
  );
}
