"use client";

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
// import { Cross2Icon } from "@radix-ui/react-icons";

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
  bg
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-overlayShow" />
        <Dialog.Content
          className={`fixed left-1/2 top-1/2 max-h-[85vh] overflow-y-auto w-[90vw] -translate-x-1/2 -translate-y-1/2 rounded-md bg-white p-6 shadow-lg focus:outline-none data-[state=open]:animate-contentShow ${bg}`}
          style={{ maxWidth }}
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
                className="absolute right-3 top-3 inline-flex h-6 w-6 appearance-none items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
                aria-label="Close"
              >
                X
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ModalBox;