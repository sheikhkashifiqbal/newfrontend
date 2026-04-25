import Image from "next/image";
import { Metadata } from "next";
import ServicesClient from "./services/ServicesClient";

export const metadata: Metadata = {
  title:
    "Engine Repair & Car Services in Baku | Suspension, Brakes, Oil Change & More",
  description:
    "Get expert engine repair in Baku along with suspension services, brake repair, battery replacement, tire services, AC service, oil change, and car diagnostics. Reliable auto service in Baku for all your vehicle needs.",
  other: {
    "google-site-verification": "iACxYXX2j0rTzino0ftnhhHgfudsBSIR743gyw9uOEg",
  },
};

export default function Home() {
  return <ServicesClient />;
}
