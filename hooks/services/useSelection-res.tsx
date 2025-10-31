'use client';

import React, { createContext, useContext, useMemo, useRef, useState } from 'react';

/** Shape stored in selection context */
export type Selections = {
  selectedCar?: string;        // brand id (stringified)
  selectedModel?: string;      // model id (stringified)
  selectedService?: string;    // service id (stringified)
  selectedDay?: string;        // e.g. "30 Oct 2025"
  selectedDateISO?: string;    // e.g. "2025-10-30"
  selectedTime?: string;       // e.g. "10:30"
};

type Ctx = {
  selections: Selections;
  setSelections: React.Dispatch<React.SetStateAction<Selections>>;
  reset: () => void;
};

const SelectionContext = createContext<Ctx | null>(null);

/** Provider for reservation modal selections */
export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo<Selections>(
    () => ({
      selectedCar: '',
      selectedModel: '',
      selectedService: '',
      selectedDay: '',
      selectedDateISO: '',
      selectedTime: '',
    }),
    []
  );

  const [selections, setSelections] = useState<Selections>(initial);
  const initialRef = useRef(initial);

  const value = useMemo<Ctx>(
    () => ({
      selections,
      setSelections,
      reset: () => setSelections(initialRef.current),
    }),
    [selections]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

/**
 * Safe hook: if used outside provider, it won't crash.
 * It returns no-op setters and empty state, plus a dev warning.
 */
export function useSelection(): Ctx {
  const ctx = useContext(SelectionContext);
  if (!ctx) {
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      (window as any).__useSelectionWarned__ ||
        console.warn('useSelection was used outside of <SelectionProvider>. It will no-op.');
      (window as any).__useSelectionWarned__ = true;
    }
    const noop = () => {};
    return {
      selections: {},
      setSelections: noop as unknown as React.Dispatch<React.SetStateAction<Selections>>,
      reset: noop,
    };
  }
  return ctx;
}
