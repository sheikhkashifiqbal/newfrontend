"use client";
import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { CardHeader } from "@/components/services/store-center-card";
import { useRouter } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

type BranchSparePartItem = {
  branch_id: number;
  branch_name: string;
  branchCoverImg: string;
  logoImg: string;
  stars: number;
  brandNames: string[];
};

export default function StoresCards() {
  const [data, setData] = useState<BranchSparePartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/branches/brand-spareparts`);
        if (res.ok) {
          const json = await res.json();
          setData(Array.isArray(json) ? json : []);
        }
      } catch (e) {
        console.error("Error loading stores:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleOpen = (branchId: number) => {
    router.push(`/spare-parts/profile?branchId=${branchId}`);
  };

  // ✅ Requirement: If item.brandNames is empty then item will not display.
  const filteredData = useMemo(() => {
    return data.filter((item) => Array.isArray(item.brandNames) && item.brandNames.length > 0);
  }, [data]);

  if (loading) return <div className="py-5">Loading...</div>;

  return (
    <div className="flex flex-col gap-y-8">
      <h1 className="text-charcoal text-[2rem] leading-[3rem] font-semibold">
        Reliable Car Spare Part Suppliers You Can Trust!
      </h1>
      <p className="text-base text-charcoal max-w-[80ch]">
        Discover seamless car maintenance with our trusted suppliers. From quality spare parts to performance upgrades,
        our platform connects you with certified professionals for genuine and reliable components.
      </p>

      <div className="py-5 grid grid-cols-1 600:grid-cols-2 mx-0 xl:grid-cols-3 gap-x-5 gap-y-6">
        {filteredData.map((item, index) => (
          <div
            key={`${item.branch_id}-${index}`}
            className="flex flex-col max-w-[392px] overflow-hidden rounded-3xl bg-white"
          >
            <img
              className="rounded-t-3xl max-h-[160px] object-cover w-full cursor-pointer"
              src={`${BASE_URL}/images/${item.branchCoverImg}`}
              alt={item.branch_name}
              onClick={() => handleOpen(item.branch_id)}
            />
            <div className="flex flex-col gap-6">
              <CardHeader
                containerClassname="p-8 pb-0"
                branchName={item.branch_name}
                logoImg={item.logoImg}
                stars={item.stars}
              />
              <div className="p-8 pt-0 flex flex-col gap-y-3">
                <p className="text-sm font-medium text-muted-gray">Popular car brands</p>
                <div className="flex flex-wrap gap-1">
                  {item.brandNames?.map((b, i) => (
                    <div
                      key={`${item.branch_id}-${i}`}
                      className="py-1.5 px-4 rounded-[52px] border border-soft-gray text-base text-charcoal font-medium"
                    >
                      {b}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
