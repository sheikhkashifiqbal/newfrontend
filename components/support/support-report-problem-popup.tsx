'use client'

import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {cn, fileSchema} from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {X} from "lucide-react";
import {useState} from 'react';
import * as React from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import SupportProblemSelector from "@/components/support/support-problem-selector";
import {grayTriggerClassname} from "@/components/shadcn-extended/SelectExt";
import CustomFormFieldTextarea from "@/components/app-custom/custom-form-field-textarea";
import CustomFormFieldFile from "@/components/app-custom/custom-form-field-file";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
// ADDED: toast
import { toast } from "sonner";

interface ISupportReportProblemPopup {
  isOpen?: boolean;
  closePopup: () => void
}

export default function SupportReportProblemPopup(
  {
    isOpen,
    closePopup
  }: ISupportReportProblemPopup
) {
  const [problemId, setProblemId] = useState<number | null>(null);
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Keep existing schema (file is optional)
  const supportReportProblemFormSchema = z.object({
    problem: z.string({ required_error: 'please select the problem' }).optional(),
    describe: z.string().optional(),
    image: fileSchema.optional()
  });

  const form = useForm<z.infer<typeof supportReportProblemFormSchema>>({
    resolver: zodResolver(supportReportProblemFormSchema),
    mode: 'onChange'
  });

  // ADDED: helper – safely extract a filename-ish value from upload response
  function pickFilenameFromUpload(resp: any): string | null {
    if (!resp || typeof resp !== 'object') return null;
    // Common keys we might get back from the upload endpoint
    const candidates = [
      resp.filename, resp.fileName, resp.name, resp.storedName, resp.savedAs,
      resp.path, resp.url
    ].filter(Boolean);

    if (candidates.length === 0) return null;

    const first = String(candidates[0]);
    // If a URL/path is returned, send only the basename (the API wants just the name)
    try {
      const url = new URL(first, window.location.origin);
      const parts = url.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] ?? first;
    } catch {
      // not a URL — may already be a bare name or a relative path
      const parts = first.split('/').filter(Boolean);
      return parts[parts.length - 1] ?? first;
    }
  }

  // ADDED: upload image first (if present) -> return filename string
  async function uploadImageIfAny(fileInput: File | File[] | undefined): Promise<string | null> {
    if (!fileInput) return null;
    const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;
    if (!(file instanceof File)) return null;

    const fd = new FormData();
    // assuming server expects "file"; change key if your backend expects something else
    fd.append("file", file);

    const res = await fetch(`${BASE_URL}/api/upload`, {
      method: "POST",
      body: fd
    });

    if (!res.ok) {
      throw new Error(`Image upload failed (${res.status})`);
    }

    const data = await res.json().catch(() => ({}));
    const filename = pickFilenameFromUpload(data);
    if (!filename) {
      // fall back to local file name if server returned nothing usable
      return file.name ?? null;
    }
    return filename;
  }

  // ADDED: submit handler to create ticket
  async function onSubmit(values: z.infer<typeof supportReportProblemFormSchema>) {
    // Validate we have a selected problemId
    if (!problemId) {
      toast.error("Please select a problem before submitting.");
      return;
    }

    toast.loading("Submitting your ticket...", { id: "ticket-submit" });

    try {
      // 1) upload image (optional) and get just the filename string
      const attachImgName = await uploadImageIfAny(values.image as any).catch((e) => {
        // Non-fatal: allow ticket creation even if image upload fails
        toast.message("Image upload failed. Submitting ticket without image.", { description: String(e) });
        return null;
      });

      // 2) create ticket
      const payload = {
        // If your backend auto-generates this, it's safe to omit;
        // kept here to mirror your example shape.
        ticketID: 0,
        problemId: problemId,
        description: values.describe ?? "",
        attachImg: attachImgName ?? "" // API expects a string name; send empty if none
      };

      const ticketRes = await fetch("${BASE_URL}/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!ticketRes.ok) {
        const errText = await ticketRes.text().catch(() => "");
        throw new Error(`Ticket creation failed (${ticketRes.status}) ${errText}`);
      }

      const ticketJson = await ticketRes.json().catch(() => ({}));
      toast.success("Ticket created successfully.", { id: "ticket-submit" });

      // Optional: reset & close (comment out closePopup() if you prefer to keep open)
      form.reset();
      setProblemId(null);
      // closePopup();

    } catch (err: any) {
      toast.error("Could not create ticket.", {
        id: "ticket-submit",
        description: err?.message ?? "Unknown error"
      });
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className={cn("overflow-y-auto max-w-[95%] 650:max-w-[650px] lg:max-w-[800px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8")}>
        <ScrollArea className={'h-[450px] 650:h-[600px]'}>
          <DialogHeader className={'w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0 pb-6'}>
            <div className={'flex justify-between items-center'}>
              <DialogTitle className={'p-0 m-0 text-2xl text-charcoal font-medium'}>
                Do you have any problem?
              </DialogTitle>
              <DialogPrimitive.Close onClick={() => {
                closePopup();
                setTimeout(() => {
                  form.reset();
                  setProblemId(null);
                }, 300);
              }}>
                <X className={'size-6 text-charcoal/50'} />
              </DialogPrimitive.Close>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={'px-8 pt-8 flex flex-col gap-y-8'}>
              <div className={'flex flex-col gap-y-2'}>
                <CustomFormFieldSelector
                  label={'Where do you have a problem'}
                  control={form.control}
                  name={'problem'}
                  Children={(_onChange, _hasError, _value) => {
                    return (
                      <SupportProblemSelector
                        value={problemId ?? undefined}
                        onChange={setProblemId}
                        placeholder="Select a problem"
                      />
                    );
                  }}
                />

                <CustomFormFieldTextarea
                  control={form.control}
                  name={'describe'}
                  label={''}
                  placeholder={'Can you describe your problem?'}
                />
              </div>

              <CustomFormFieldFile
                control={form.control}
                name={'image'}
                label={'Attach image'}
                description={'If you have screenshot or image related to the problem feel free to send it'}
              />

              {/* If CustomBlueBtn supports a disabled/loading prop in your project, you can wire it here.
                  Otherwise it will still work as the submit trigger. */}
              <CustomBlueBtn text={'Submit'} />
            </form>
          </Form>

        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
