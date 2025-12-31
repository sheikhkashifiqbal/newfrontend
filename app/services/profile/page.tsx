import React, { Suspense } from "react";
import PerformanceCenterPageClient from "./PerformanceCenterPageClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PerformanceCenterPageClient />
    </Suspense>
  );
}

