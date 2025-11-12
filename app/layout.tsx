import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "./client-layout";

const interFont = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",        // 🧩 ensures deterministic font class
});

export const metadata: Metadata = {
  title: "VehicleOps",
  description: "Car service and spare parts platform",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>   
      <body
        className={`antialiased ${interFont.variable ?? ""}`}
        suppressHydrationWarning                  
      >
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
