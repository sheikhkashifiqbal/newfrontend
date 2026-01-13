"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import CustomFormFieldTextarea from "@/components/app-custom/custom-form-field-textarea";
import CustomBlueBtn from "@/components/app-custom/CustomBlueBtn";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserBookingCompleted } from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab-columns";
import { Rating } from "react-simple-star-rating";
import { UserSparePartAccepted } from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers-columns";

interface IUserReviewExperiencePopup {
  reviewedRow: null | UserBookingCompleted | UserSparePartAccepted;
  closePopup: () => void;

  /**
   * ✅ Called after successful submit so parent table can update ONLY the respective row.
   *
   * - For Service booking reviews:
   *   entityId = reservationId
   *
   * - For Spare parts reviews:
   *   entityId = sparepartsrequestId
   *
   * IMPORTANT (your corrected requirement):
   * For spare parts, the UI must display "Review is sent" ONLY when:
   *   sparepartsrequestId (JSON request) == sparepartsrequest_id (JSON response row)
   * AND the POST request was submitted successfully.
   */
  onReviewSubmitted?: (entityId: number, stars: number) => void;
}

export default function UserReviewExperiencePopup({
  reviewedRow,
  closePopup,
  onReviewSubmitted,
}: IUserReviewExperiencePopup) {
  const userReviewExperiencePopupFormSchema = z.object({
    rate: z
      .number({ required_error: "Stars are required" })
      .min(1, "Stars are required")
      .max(5, "Stars are required"),
    experience: z
      .string({ required_error: "Experience is required" })
      .min(1, "Experience is required"),
  });

  const form = useForm<z.infer<typeof userReviewExperiencePopupFormSchema>>({
    resolver: zodResolver(userReviewExperiencePopupFormSchema),
    defaultValues: {
      rate: 0,
      experience: "",
    },
  });

  const [submitting, setSubmitting] = React.useState(false);

  function getUserIdFromLocalStorage(): number | null {
    try {
      const raw = localStorage.getItem("auth_response");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const id = parsed?.id;
      const num = Number(id);
      if (!Number.isFinite(num) || num <= 0) return null;
      return num;
    } catch {
      return null;
    }
  }

  // Identify if this popup is opened for spare parts flow
  function isSparePartsRow(): boolean {
    const anyRow = reviewedRow as any;
    return anyRow?.sparepartsrequest_id != null;
  }

  /**
   * ✅ For spare parts flow:
   * The sparepartsrequestId used in JSON request MUST come from
   * /api/spare-parts/offers/by-user response element "sparepartsrequest_id"
   * and must match that same row’s "sparepartsrequest_id".
   */
  function getSparepartsRequestIdFromRow(): number | null {
    const anyRow = reviewedRow as any;
    const v = anyRow?.sparepartsrequest_id ?? anyRow?.sparepartsrequestId;
    const num = Number(v);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
  }

  // Existing service review helpers (kept)
  function getBranchBrandServiceIdFromRow(): number | null {
    const anyRow = reviewedRow as any;
    const v =
      anyRow?.branch_brand_serviceid ??
      anyRow?.branchBrandServiceID ??
      anyRow?.branchBrandServiceId;

    const num = Number(v);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
  }

  /**
   * reservationId MUST come from /api/reservations/by-user -> element "reservation_id".
   * In page.tsx, you already map: id = reservation.reservation_id
   * So here we safely pick reservationId from (reviewedRow as any).id first,
   * and fallback to reservation_id if present.
   */
  function getReservationIdFromRow(): number | null {
    const anyRow = reviewedRow as any;
    const v = anyRow?.id ?? anyRow?.reservation_id ?? anyRow?.reservationId;
    const num = Number(v);
    if (!Number.isFinite(num) || num <= 0) return null;
    return num;
  }

  async function onSubmit(values: z.infer<typeof userReviewExperiencePopupFormSchema>) {
    if (!reviewedRow) return;

    const userId = getUserIdFromLocalStorage();
    const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!userId) {
      alert("User not found in local storage. Please login again.");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Spare parts review submit
      if (isSparePartsRow()) {
        const sparepartsrequestId = getSparepartsRequestIdFromRow();
        if (!sparepartsrequestId) {
          alert("sparepartsrequest_id not found for this spare parts request.");
          return;
        }

        /**
         * JSON Request (as per your requirement):
         * {
         *   "rateExperienceId": 1,
         *   "branchBrandSparepartId": 1,
         *   "sparepartsrequestId": 1,
         *   "description": "...",
         *   "userId": 1,
         *   "stars": 3
         * }
         *
         * IMPORTANT (correct requirement):
         * We track success by sparepartsrequestId, and the table compares:
         * sparepartsrequestId (request) == sparepartsrequest_id (response row)
         * before showing "Review is sent".
         */
        const branchBrandSparepartId = sparepartsrequestId; // keep your current mapping convention

        const res = await fetch(`${BASE_URL}/api/rate-sparepart-experiences`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rateExperienceId: 1,
            branchBrandSparepartId: branchBrandSparepartId,
            sparepartsrequestId: sparepartsrequestId,
            description: values.experience,
            userId: userId,
            stars: values.rate,
          }),
        });

        if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);

        // ✅ Mark ONLY this sparepartsrequestId as reviewed in parent
        onReviewSubmitted?.(sparepartsrequestId, values.rate);

        // ✅ Close popup modal after successful submit
        closePopup();
        setTimeout(() => {
          form.reset({ rate: 0, experience: "" });
        }, 300);

        return;
      }

      // ✅ Service booking review submit (kept)
      const branchBrandServiceID = getBranchBrandServiceIdFromRow();
      const reservationId = getReservationIdFromRow();

      if (!branchBrandServiceID) {
        alert("branch_brand_serviceid not found for this reservation.");
        return;
      }
      if (!reservationId) {
        alert("reservation_id not found for this reservation.");
        return;
      }

      const res = await fetch(`${BASE_URL}/api/rate-experiences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchBrandServiceID: branchBrandServiceID,
          stars: values.rate,
          userId: userId,
          reservationId: reservationId,
          description: values.experience,
        }),
      });

      if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);

      // ✅ Mark ONLY this reservationId as reviewed in parent
      onReviewSubmitted?.(reservationId, values.rate);

      // ✅ Close popup modal after successful submit
      closePopup();
      setTimeout(() => {
        form.reset({ rate: 0, experience: "" });
      }, 300);
    } catch (e: any) {
      alert(e?.message ?? "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  }

  const handleRating = (rate: number) => {
    // Some Rating components return 1..5, others return 0..100. Normalize to 1..5.
    let stars = rate;
    if (rate > 5) {
      stars = Math.round(rate / 20);
    }
    stars = Math.max(0, Math.min(5, Math.round(stars)));
    form.setValue("rate", stars, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Dialog open={!!reviewedRow}>
      <DialogContent
        className={cn(
          "overflow-y-auto max-w-[95%] 650:max-w-[600px] lg:max-w-[600px] max-h-[450px] 650:max-h-[600px] bg-light-gray rounded-3xl py-8 flex flex-col gap-y-8"
        )}
      >
        <ScrollArea className={"h-[450px] 650:h-[600px]"}>
          <DialogHeader className={"w-full flex flex-col gap-8 border-b-[1px] border-b-blue-gray p-8 pt-0 pb-6"}>
            <div className={"flex justify-between items-center"}>
              <DialogTitle className={"p-0 m-0 text-2xl text-charcoal font-medium"}>
                How would you rate your experience?
              </DialogTitle>

              <DialogPrimitive.Close
                onClick={() => {
                  closePopup();
                  setTimeout(() => {
                    form.reset();
                  }, 300);
                }}
              >
                <X className={"size-6 text-charcoal/50"} />
              </DialogPrimitive.Close>
            </div>

            <div className={"flex items-center justify-between gap-5"}>
              <div className={"flex flex-col gap-2"}>
                <p className={"text-misty-gray font-medium text-xs"}>Service & Location</p>
                <h4 className={"text-dark-gray text-base font-medium"}>{(reviewedRow as any)?.service}</h4>
              </div>

              <div className={"flex flex-col gap-2"}>
                <p className={"text-misty-gray font-medium text-xs"}>Car & Service type</p>
                <div className={"flex flex-col"}>
                  {/*@ts-ignore*/}
                  <h4 className={"text-dark-gray text-base font-medium"}>{(reviewedRow as any)?.car}</h4>
                  {/*@ts-ignore*/}
                  <h4 className={"text-dark-gray text-base font-medium"}>{(reviewedRow as any)?.serviceType}</h4>
                </div>
              </div>
            </div>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className={"pt-5 px-8 flex flex-col gap-y-8"}>
              <div className={"flex flex-col gap-y-3"}>
                <h4 className={"text-dark-gray text-base font-medium"}>In a 5 star rate what was your experience?</h4>
                <Rating
                  allowFraction={false}
                  transition={true}
                  onClick={handleRating}
                  SVGclassName={"inline-block"}
                  emptyColor={"#E9ECEF"}
                  allowHover={false}
                />
                {form.formState.errors.rate?.message && (
                  <p className="text-red-600 text-sm">{String(form.formState.errors.rate.message)}</p>
                )}
              </div>

              <CustomFormFieldTextarea
                name={"experience"}
                control={form.control}
                label={""}
                placeholder={"Anything else that you’d like to share  about your experience?"}
              />
              {form.formState.errors.experience?.message && (
                <p className="text-red-600 text-sm">{String(form.formState.errors.experience.message)}</p>
              )}

              <CustomBlueBtn
                className={"mt-4"}
                type={"submit"}
                // @ts-ignore
                disabled={submitting}
                text={submitting ? "Submitting..." : "Submit"}
              />
            </form>
          </Form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
