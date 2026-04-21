import { Metadata } from "next";
import SparePartsClient from "./SparePartsClient";

export const metadata: Metadata = {
  title:
    "Mechanical & Car Repair Services in Baku | Auto Service & Vehicle Maintenance",
  description:
    "Looking for reliable mechanical services in Baku? We offer expert car repair, auto service, and complete vehicle maintenance in Baku to keep your car running smoothly. Book your service today!",
  other: {
    "google-site-verification": "iACxYXX2j0rTzino0ftnhhHgfudsBSIR743gyw9uOEg",
  },
};

export default function Page() {
  return <SparePartsClient />;
}