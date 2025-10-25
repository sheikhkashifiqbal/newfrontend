"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface ModalProps {
  trigger?: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  maxWidth?: string;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  bg?: string;
}

const ModalBox: React.FC<ModalProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  maxWidth = "500px",
  title,
  description,
  showCloseButton = true,
  bg = "bg-white",
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        {/* Dark overlay */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 data-[state=open]:animate-overlayShow" />

        {/* Centered modal box */}
        <Dialog.Content
          className={`fixed z-50 left-1/2 top-1/2 w-[90vw] max-h-[85vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 shadow-xl focus:outline-none data-[state=open]:animate-contentShow ${bg}`}
          style={{ maxWidth }}
        >
          {title && (
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </Dialog.Title>
          )}

          {description && (
            <Dialog.Description className="text-sm text-gray-500 mb-3">
              {description}
            </Dialog.Description>
          )}

          {/* Popup content (your selectors, etc.) */}
          <div className="relative z-50">{children}</div>

          {showCloseButton && (
            <Dialog.Close asChild>
              <button
                className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                ✕
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalBox;
