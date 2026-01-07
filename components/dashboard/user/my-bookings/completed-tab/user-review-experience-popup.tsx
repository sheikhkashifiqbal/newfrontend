'use client'

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
	UserBookingCompleted
} from "@/components/dashboard/user/my-bookings/completed-tab/user-bookings-completed-tab-columns";
import { Rating } from "react-simple-star-rating";
import {
	UserSparePartAccepted
} from "@/components/dashboard/user/spare-part-request/accepted-offers-tab/user-spare-part-accepted-offers-columns";

interface IUserReviewExperiencePopup {
	reviewedRow: null | UserBookingCompleted | UserSparePartAccepted;
	closePopup: () => void;

	/**
	 * Called after successful submit so parent table can update only the respective row UI.
	 * Pass reservationId (reviewedRow.id) and stars (1..5).
	 */
	onReviewSubmitted?: (reservationId: number, stars: number) => void;
}

export default function UserReviewExperiencePopup(
		{
			reviewedRow,
			closePopup,
			onReviewSubmitted,
		}: IUserReviewExperiencePopup
) {
	const userReviewExperiencePopupFormSchema = z.object({
		// We store stars as 1..5
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
			console.log("id::", id);
			if (!Number.isFinite(num) || num <= 0) return null;
			return num;
		} catch {
			return null;
		}
	}

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

	async function onSubmit(values: z.infer<typeof userReviewExperiencePopupFormSchema>) {
		if (!reviewedRow) return;

		const userId = getUserIdFromLocalStorage();
		const branchBrandServiceID = getBranchBrandServiceIdFromRow();
		
		console.log("id::", userId);

		if (!userId) {
			alert("User not found in local storage. Please login again.");
			return;
		}
		if (!branchBrandServiceID) {
			alert("branch_brand_serviceid not found for this reservation.");
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch("http://localhost:8081/api/rate-experiences", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					branchBrandServiceID,
					stars: values.rate,
					user_id: userId,
					description: values.experience,
				}),
			});

			if (!res.ok) throw new Error(`Request failed (HTTP ${res.status})`);

			// Update only the respective row in parent table
			const reservationId = Number((reviewedRow as any)?.reservation_id ?? (reviewedRow as any)?.id);
			if (Number.isFinite(reservationId) && reservationId > 0) {
				onReviewSubmitted?.(reservationId, values.rate);
			}

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
