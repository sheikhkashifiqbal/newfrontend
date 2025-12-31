"use client";

import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MySidebar from "@/components/sidebar";

// ✅ Client-only load (prevents Node build/prerender from evaluating the module)
const Providers = dynamic(
  () => import("@/components/toast/toast-provider").then((m) => m.Providers),
  { ssr: false }
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MySidebar />
      <Header />
      {children}
      <Providers />
      <Footer />
    </>
  );
}
