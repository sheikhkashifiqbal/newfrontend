"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface ModelBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export default function ModelBox({
  open,
  onOpenChange,
  children,
}: ModelBoxProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />

        <Dialog.Content className="fixed z-50 left-1/2 top-1/2 w-[95%] max-w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-lg">
          {/* ✅ REQUIRED for Radix accessibility */}
          <VisuallyHidden>
            <DialogTitle>Dialog</DialogTitle>
          </VisuallyHidden>

          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}