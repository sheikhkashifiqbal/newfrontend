'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { PlusIcon, X } from "lucide-react";
import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useFieldArray, useForm } from "react-hook-form";
import CustomFormField from "@/components/app-custom/CustomFormField";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { useEffect, useState } from "react";
import { IReservationServiceSparepart } from "@/components/dashboard/service/my-bookings/list-view/upcoming-tab/service-bookings-upcoming-columns";
import { toast } from "sonner";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface IServiceBookingsAddEditSpareParts {
  open: boolean;
  reservationId: number | null;
  reservationParts: IReservationServiceSparepart[];
  onClose: () => void;
  onSaved: () => void;
}

interface ISparePartOption {
  sparepartsId: number;
  sparepartsType: string;
}

// ✅ Simple form type with NO validation coupling
type SparePartsFormValues = {
  parts: {
    id?: number;
    name?: string;
    quantity?: number;
  }[];
};

export default function ServiceBookingsAddEditSparePartsPopup({
  open,
  reservationId,
  reservationParts,
  onClose,
  onSaved
}: IServiceBookingsAddEditSpareParts) {
  const [sparePartOptions, setSparePartOptions] = useState<ISparePartOption[]>([]);
  const [selectedSparepartsId, setSelectedSparepartsId] = useState<number | "">("");

  // ✅ useForm WITHOUT zodResolver (no validation)
  const form = useForm<SparePartsFormValues>({
    defaultValues: {
      parts: []
    },
    mode: "onChange"
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "parts"
  });

  // Fetch spare part options when popup opens
  useEffect(() => {
    if (!open) return;

    async function fetchSpareParts() {
      try {
        const res = await fetch(`${BASE_URL}/api/spare-parts`);
        if (!res.ok) {
          console.error("Failed to fetch spare parts", res.status);
          return;
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setSparePartOptions(data as ISparePartOption[]);
          // Default selected: first from backend OR first of existing parts
          if (reservationParts && reservationParts.length > 0) {
            setSelectedSparepartsId(reservationParts[0].spareparts_id);
          } else if (data[0]) {
            setSelectedSparepartsId(data[0].sparepartsId);
          }
        }
      } catch (e) {
        console.error("Failed to fetch spare parts list", e);
      }
    }

    fetchSpareParts();
  }, [open, reservationParts]);

  // Initialize form values from reservationParts when popup opens
  useEffect(() => {
    if (!open) return;

    if (reservationParts && reservationParts.length > 0) {
      form.reset({
        parts: reservationParts.map((p) => ({
          id: p.reservation_service_sparepart_id,
          name: p.part_name,
          quantity: p.qty
        }))
      });
    } else {
      // default one empty row
      form.reset({
        parts: [
          {
            id: undefined,
            name: "",
            quantity: 1
          }
        ]
      });
    }
  }, [open, reservationParts, form]);

  const selectedSparePartLabel =
    sparePartOptions.find((o) => o.sparepartsId === selectedSparepartsId)?.sparepartsType ??
    "Select spare part type";

  async function handleDeleteRow(index: number, id?: number) {
    try {
      if (id) {
        await fetch(`${BASE_URL}/api/reservation-service-spareparts/${id}`, {
          method: "DELETE"
        });
      }
      if (fields.length > 1) {
        remove(index);
      }
    } catch (e) {
      console.error("Failed to delete spare part row", e);
      toast.error("Failed to delete spare part.");
    }
  }

  // ✅ NO Zod type, NO validation – will always be called when button is clicked
  async function onSubmit(values: SparePartsFormValues) {
    console.log("ReservationId::", reservationId);
    console.log("Submitted values::", values);

    if (!reservationId) {
      toast.error("Reservation ID is missing.");
      return;
    }

    // ❌ Validation on spare part type REMOVED as per your request
    // if (!selectedSparepartsId) {
    //   toast.error("Please select a spare part type.");
    //   return;
    // }

    try {
      const existing = (values.parts || []).filter((p) => p.id);
      for (const part of existing) {
        await fetch(`${BASE_URL}/api/reservation-service-spareparts/${part.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partName: part.name ?? "",
            qty: part.quantity ?? 0,
            reservationId: reservationId,
            sparepartsId: selectedSparepartsId || null
          })
        });
      }

      const created = (values.parts || []).filter((p) => !p.id);
      for (const part of created) {
        await fetch(`${BASE_URL}/api/reservation-service-spareparts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            partName: part.name ?? "",
            qty: part.quantity ?? 0,
            reservationId: reservationId,
            sparepartsId: selectedSparepartsId || null
          })
        });
      }

      toast.success("Spare parts updated successfully.");

      await onSaved();
      handleClose();
    } catch (e) {
      console.error("Failed to save spare parts", e);
      toast.error("Failed to save spare parts.");
    }
  }

  function handleClose() {
    onClose();
    setTimeout(() => {
      form.reset();
    }, 300);
  }

  return (
    <Dialog open={open}>
      <DialogContent
        className={cn(
          "overflow-y-auto max-w-[95%] 650:max-w-[520px] max-h-[450px] 650:max-h-[550px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8"
        )}
      >
        <ScrollArea className={"h-[450px] 650:h-[550px]"}>
          <DialogHeader className={"w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0"}>
            <div className={"flex justify-between items-center"}>
              <DialogTitle className={"p-0 m-0 text-2xl text-charcoal font-medium"}>
                Required spare part
              </DialogTitle>
              <DialogPrimitive.Close onClick={handleClose}>
                <X className={"size-6 text-charcoal/50"} />
              </DialogPrimitive.Close>
            </div>

            {/* Spare part type chip + selector (engine, brakes, etc.) */}
            <div className="flex flex-col gap-3">
              <div className={"max-w-fit bg-ice-mist rounded-[8px] py-2 px-4 border border-soft-sky"}>
                {selectedSparePartLabel}
              </div>
              <div className="flex flex-col gap-1 max-w-xs">
                <label className="text-xs text-dark-gray font-medium">Spare part type</label>
                <select
                  className="h-10 rounded-md border border-soft-gray bg-white px-3 text-sm text-dark-gray"
                  value={selectedSparepartsId}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSelectedSparepartsId(isNaN(val) ? "" : val);
                  }}
                >
                  <option value="">Select type</option>
                  {sparePartOptions.map((opt) => (
                    <option key={opt.sparepartsId} value={opt.sparepartsId}>
                      {opt.sparepartsType}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"px-8 pt-8 flex flex-col gap-y-4"}>
              <div className={"flex flex-col gap-y-4"}>
                {fields.map((field, index) => {
                  const fieldId = form.watch(`parts.${index}.id`);
                  return (
                    <div className={"flex gap-4"} key={field.id}>
                      {/* Hidden field for id */}
                      <input
                        type="hidden"
                        {...form.register(`parts.${index}.id` as const)}
                      />

                      <CustomFormField
                        name={`parts.${index}.name`}
                        control={form.control}
                        isItalicPlaceholder={true}
                        label={"Enter part name"}
                        placeholder={"Enter part name"}
                        containerClassname={"basis-[60%]"}
                      />

                      <CustomFormField
                        name={`parts.${index}.quantity`}
                        control={form.control}
                        isItalicPlaceholder={true}
                        label={"Ex: 100"}
                        placeholder={"Ex: 100"}
                        containerClassname={"basis-[30%]"}
                        inputType={"number"}
                      />

                      <div className={"flex flex-col gap-y-3 basis-[10%]"}>
                        <h5 className={"text-dark-gray text-sm font-medium"}>Delete</h5>
                        <div
                          onClick={() => handleDeleteRow(index, fieldId)}
                          className={
                            "cursor-pointer flex items-center justify-center h-14 rounded-xl border border-soft-gray bg-white px-4"
                          }
                        >
                          <X className={"text-[#AEA8A8] size-6"} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type={"button"}
                onClick={() => {
                  append({ id: undefined, name: "", quantity: 1 });
                }}
                className={"max-w-fit flex items-center rounded-[8px] py-3 px-4 bg-soft-gray"}
              >
                <PlusIcon className={"text-dark-gray text-base"} />
                <h6 className={"text-xs font-medium text-dark-gray"}>Add spare part</h6>
              </Button>

              <CustomBlueBtn type={"submit"} text={"Add Spare Parts"} />
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
