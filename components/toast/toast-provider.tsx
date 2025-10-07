'use client';
import { Toaster } from "sonner";

export function Providers() {
  return (
    <Toaster position="top-right" richColors closeButton duration={4000} style={{ zIndex: 100000 }} />
  );
}
