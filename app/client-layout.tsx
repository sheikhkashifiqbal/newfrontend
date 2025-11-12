"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MySidebar from "@/components/sidebar";
import { Providers } from "@/components/toast/toast-provider";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
