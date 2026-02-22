"use client";
import React, { useEffect, useMemo, useState } from "react";

type ReviewItem = {
  stars: number;
  text: string;
  author: string;
  date: string;
};

type SummaryResponse = {
  ratings: { rate_experienceid: number; date: string; user_name: string; stars: number; description: string }[];
  star_1?: string; star_2?: string; star_3?: string; star_4?: string; star_5?: string;
  total_ratings: number;
};

export default function CompanyReviews({ branchId }: { branchId?: number }) {
  const [filter, setFilter] = useState("All stars");
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [bars, setBars] = useState<{ stars: number; percent: number }[]>([
    { stars: 5, percent: 0 },
    { stars: 4, percent: 0 },
    { stars: 3, percent: 0 },
    { stars: 2, percent: 0 },
    { stars: 1, percent: 0 },
  ]);
  const [total, setTotal] = useState<number>(0);

  const overall = useMemo(() => {
    if (!reviews.length) return 0;
    // mode of stars
    const m = new Map<number, number>();
    reviews.forEach(r => m.set(r.stars, (m.get(r.stars) || 0) + 1));
    let best = 0, bestN = -1;
    for (const [k,v] of m) { if (v > bestN) { best = k; bestN = v; } }
    return best;
  }, [reviews]);

  useEffect(() => {
    if (!branchId) return;
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/spareparts-rating`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ branchId: branchId })
        });
        if (!res.ok) return;
        const json: SummaryResponse = await res.json();

        // Reviews list mapping
        const mapped: ReviewItem[] = (json.ratings || []).map(r => ({
          stars: r.stars,
          text: r.description,
          author: r.user_name,
          date: r.date
        }));
        setReviews(mapped);

        // totals
        setTotal(json.total_ratings || 0);

        // bars
        const pct = (s?: string) => (s && s.endsWith("%")) ? Number(s.replace("%","")) : 0;
        setBars([
          { stars: 5, percent: pct(json.star_5) },
          { stars: 4, percent: pct(json.star_4) },
          { stars: 3, percent: pct(json.star_3) },
          { stars: 2, percent: pct(json.star_2) },
          { stars: 1, percent: pct(json.star_1) },
        ]);
      } catch {}
    })();
  }, [branchId]);

  const filteredReviews =
    filter === "All stars"
      ? reviews
      : reviews.filter((r) => r.stars === parseInt(filter));

  return (
    <div className="bg-[#F8F9FA] min-h-screen">
      <div className="max-w-[1120px] mx-auto grid grid-cols-1 md:grid-cols-[320px_1fr] gap-8">
        {/* Left Side: Ratings Summary */}
        <div>
          {/* Overall Rating (mode) */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex text-[#F9B774] gap-1">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <svg
                    key={i}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="w-5 h-5"
                  >
                    <path d="M12 .587l3.668 7.568L24 9.753l-6 5.847 1.42 8.29L12 19.771l-7.42 4.119L6 15.6 0 9.753l8.332-1.598L12 .587z" />
                  </svg>
                ))}
            </div>
            <p className="font-medium text-gray-800 text-lg">{overall} out of 5</p>
          </div>
          <p className="text-sm text-gray-500 mb-4">{total} ratings2222</p>

          {/* Rating Bars */}
          <div className="flex flex-col gap-2">
            {bars.map((r) => (
              <div key={r.stars} className="flex items-center gap-2">
                <p className="w-[40px] text-sm text-gray-600">{r.stars} star</p>
                <div className="flex-1 h-4 bg-gray-200 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-[#F9B774]"
                    style={{ width: `${r.percent}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 w-[40px] text-right">
                  {r.percent}%
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Reviews List */}
        <div>
          {/* Filter */}
          <div className="flex flex-col justify-between items-start gap-2 mb-6">
            <h3 className="text-lg font-medium text-gray-800">Filter by</h3>

            <div className="relative">
              <select className="appearance-none bg-[#ffffff] border min-w-[144px] py-2.5 px-4 pr-10 rounded-[8px] text-gray-700"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All stars</option>
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-6">
            {filteredReviews.map((review, index) => (
              <div key={index} className="pb-6 border-b border-gray-200">
                <div className="flex gap-1 items-center mb-2 text-[#F9B774]">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={
                          i < review.stars ? "currentColor" : "none"
                        }
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        className="w-5 h-5"
                      >
                        <path d="M12 .587l3.668 7.568L24 9.753l-6 5.847 1.42 8.29L12 19.771l-7.42 4.119L6 15.6 0 9.753l8.332-1.598L12 .587z" />
                      </svg>
                    ))}
                </div>
                <p className="text-gray-800 text-sm mb-2">{review.text}</p>
                <p className="text-gray-500 text-sm italic">
                  By {review.author} &nbsp; {review.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
