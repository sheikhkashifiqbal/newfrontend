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
  disableOutsideClose?: boolean;
}

const ModalBox: React.FC<ModalProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  maxWidth = "808px",
  title,
  description,
  showCloseButton = true,
  bg = "",
  disableOutsideClose = false,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        {/* Overlay above page */}
        <Dialog.Overlay className="fixed inset-0 z-[1000] bg-black/50 data-[state=open]:animate-overlayShow" />
        {/* Content above overlay */}
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 z-[1001] max-h-[85vh] w-[90vw] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-contentShow ${bg}`}
          style={{ maxWidth }}
          onPointerDownOutside={disableOutsideClose ? (e) => e.preventDefault() : undefined}
          onEscapeKeyDown={disableOutsideClose ? (e) => e.preventDefault() : undefined}
        >
          {title && (
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {title}
            </Dialog.Title>
          )}
          {description && (
            <Dialog.Description className="mt-1 text-sm text-gray-500">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-4">{children}</div>

          {showCloseButton && (
            <Dialog.Close asChild>
              <button
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100"
                aria-label="Close"
                type="button"
              >
                ×
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalBox;
