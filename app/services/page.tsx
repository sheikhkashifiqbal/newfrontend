"use client"
import ServicesSlider from "@/components/services/services-slider";
import ServicesSelectors from "@/components/services/services-selectors";
import Container from "@/components/Container";
import ServicesCards from "@/components/services/ServicesCards";
import * as React from "react";
import ServicesSearchResults from "@/components/services/services-search-results";
import { useCallback, useState } from "react";
import { Toaster } from "sonner";
import { format } from "date-fns";

type ResultItem = {
  branchId: number;
  branchName: string;
  location: string;
  companyRating: number | null;
  distanceKm: number | null;
  companyLogoUrl: string | null;
  availableTimeSlots: string[] | null;
  price: number | null;
};

type SortBy = "DISTANCE_CLOSEST" | "DISTANCE_FARTHEST" | "RATING_HIGH_TO_LOW";

export default function Services() {
  const [showResults, setShowResults] = useState(false);
  const [serverPayload, setServerPayload] = useState<Record<string, unknown>>({});
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedDateISO, setSelectedDateISO] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [sortBy, setSortBy] = useState<SortBy | undefined>(undefined);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const doFetch = useCallback(async (payload: Record<string, unknown>) => {
    try {
      const res = await fetch(`${BASE_URL}/api/branches/services/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setResults([]);
    }
  }, []);

  const composePayload = useCallback(
    (base: Record<string, unknown>, opts?: { dateISO?: string; sort?: SortBy }) => {
      const withDate = opts?.dateISO ? { ...base, date: opts.dateISO } : { ...base };
      const withSort = opts?.sort ? { ...withDate, sortBy: opts.sort } : withDate;

      const clean: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(withSort)) {
        if (v !== null && v !== undefined && !(typeof v === "string" && v.trim() === "")) clean[k] = v;
      }
      console.log("Final payload (with date/sort):", clean);
      return clean;
    },
    []
  );

  const handleSubmitSearch = useCallback(
    async (basePayload: Record<string, unknown>) => {
      setShowResults(true);
      setServerPayload(basePayload);
      const payload =
        "date" in basePayload && basePayload.date
          ? composePayload(basePayload)
          : composePayload(basePayload, { dateISO: selectedDateISO, sort: sortBy });
      await doFetch(payload);
    },
    [composePayload, doFetch, selectedDateISO, sortBy]
  );

  // ✅ Chip click: immediately submit using the clicked date plus current selectors
  const handleChangeDate = useCallback(
    async (iso: string) => {
      setSelectedDateISO(iso);
      if (!showResults) return;
      const payload = composePayload(serverPayload, { dateISO: iso, sort: sortBy });
      await doFetch(payload);
    },
    [composePayload, doFetch, serverPayload, showResults, sortBy]
  );

  const handleChangeSort = useCallback(
    async (sort: SortBy) => {
      setSortBy(sort);
      if (!showResults) return;
      const payload = composePayload(serverPayload, { dateISO: selectedDateISO, sort });
      await doFetch(payload);
    },
    [composePayload, doFetch, serverPayload, showResults, selectedDateISO]
  );

  return (
    <>
      <div className={"min-h-screen bg-light-gray"}>
        <ServicesSlider />
        <ServicesSelectors
          onSearchClicked={() => setShowResults(true)}
          onSubmitSearch={handleSubmitSearch}
          selectedDateISO={selectedDateISO} // keeps DatePicker in sync with chip clicks
        />
        <section className={"w-full bg-light-gray py-10"}>
          <Container>
            {!showResults && <ServicesCards />}
            {showResults && (
              <ServicesSearchResults
                results={results}
                selectedDateISO={selectedDateISO}
                onChangeDate={handleChangeDate}
                onChangeSort={handleChangeSort}

              />
            )}
          </Container>
        </section>
      </div>
      <Toaster />
    </>
  );
}
