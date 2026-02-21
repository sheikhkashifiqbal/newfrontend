'use client'

import React, { useEffect, useMemo, useState } from "react";
import { Separator } from "@/components/ui/separator";
import CustomCheckbox from "@/components/app-custom/custom-checkbox";
import { ServiceRegistrationTip } from "@/components/register/service-register/service-registration-step-2";


import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

interface IServiceRegistrationStep3 {
  form: any;
}

type StripeElementChangeEvent = {
  complete: boolean;
  empty: boolean;
  error?: { message?: string };
};

const elementBaseClass =
  "w-full bg-white rounded-[12px] border border-steel-blue/20 px-4 py-3 text-sm text-charcoal outline-none focus:border-royal-blue/60";

const labelBase = "text-sm font-semibold text-steel-blue";
const helpBase = "text-xs text-charcoal/50";
const errorBase = "text-xs text-red-500 font-medium mt-1";

const stripeElementOptions = {
  style: {
    base: {
      fontSize: "14px",
      color: "#2B2B2B",
      fontFamily: "inherit",
      "::placeholder": {
        color: "rgba(43,43,43,0.4)",
      },
    },
    invalid: {
      color: "#ef4444",
    },
  },
};

export default function ServiceRegistrationStep3({ form }: IServiceRegistrationStep3) {
  const stripe = useStripe();
  const elements = useElements();

  const [addCardLater, setAddCardLater] = useState(false);

  const [cardholderName, setCardholderName] = useState("");
  const [pmError, setPmError] = useState<string>("");

  const [touched, setTouched] = useState({
    name: false,
    number: false,
    expiry: false,
    cvc: false,
  });

  const [complete, setComplete] = useState({
    number: false,
    expiry: false,
    cvc: false,
  });

  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    number?: string;
    expiry?: string;
    cvc?: string;
  }>({});

  // Keep values in RHF (optional but useful)
  useEffect(() => {
    try {
      form?.setValue?.("addDebitCardLater", addCardLater, { shouldDirty: true });
      form?.setValue?.("cardholderName", cardholderName, { shouldDirty: true });
    } catch {
      // ignore
    }
  }, [addCardLater, cardholderName, form]);

  useEffect(() => {
    if (addCardLater) {
      setPmError("");
      setFieldErrors({});
      try {
        form?.setValue?.("stripePaymentMethodId", "", { shouldDirty: true });
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addCardLater]);

  function validateLocalFields() {
    if (addCardLater) {
      setFieldErrors({});
      return true;
    }

    const next: typeof fieldErrors = {};

    if (!cardholderName.trim()) next.name = "Cardholder name is required.";

    // Stripe Elements provide their own validation; we ensure completion
    if (!complete.number) next.number = "Card number is incomplete or invalid.";
    if (!complete.expiry) next.expiry = "Expiry date is incomplete or invalid.";
    if (!complete.cvc) next.cvc = "Security code is incomplete or invalid.";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  const canUseStripe = useMemo(() => !!stripe && !!elements, [stripe, elements]);

  async function validateWithStripePaymentMethod(): Promise<boolean> {
    if (addCardLater) return true;

    // local checks first (name + completeness)
    const okLocal = validateLocalFields();
    if (!okLocal) return false;

    if (!stripe || !elements) {
      setPmError("Stripe is not ready. Please refresh the page and try again.");
      return false;
    }

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) {
      setPmError("Card input is not available. Please refresh and try again.");
      return false;
    }

    setPmError("");

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumber,
      billing_details: {
        name: cardholderName.trim(),
      },
    });

    if (result.error) {
      setPmError(result.error.message || "Card validation failed. Please check your details.");
      return false;
    }

    // ✅ Valid card details (Stripe verified format and created PM)
    const paymentMethodId = result.paymentMethod?.id || "";

    try {
      form?.setValue?.("stripePaymentMethodId", paymentMethodId, { shouldDirty: true });
    } catch {
      // ignore
    }

    return true;
  }

  /**
   * IMPORTANT:
   * Your “Register Company & Branches” button likely submits the main <form>.
   * This intercepts submit, runs Stripe validation, and only then allows submit.
   */
  useEffect(() => {
    const formEl = document.querySelector("form");
    if (!formEl) return;

    const onSubmitCapture = async (e: Event) => {
      // If add-later, do nothing
      if (addCardLater) return;

      // block by default while we validate
      e.preventDefault();
      e.stopPropagation();

      setTouched({
        name: true,
        number: true,
        expiry: true,
        cvc: true,
      });

      const ok = await validateWithStripePaymentMethod();
      if (!ok) {
        // scroll to first error
        try {
          const first = document.querySelector("[data-card-error='true']");
          first?.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          // ignore
        }
        return;
      }

      // If valid, submit the form programmatically
      // NOTE: requestSubmit preserves native validation & submit handlers
      try {
        // @ts-ignore
        formEl.requestSubmit?.();
      } catch {
        // fallback
        // @ts-ignore
        formEl.submit?.();
      }
    };

    // capture phase to intercept before other handlers
    formEl.addEventListener("submit", onSubmitCapture, true);
    return () => formEl.removeEventListener("submit", onSubmitCapture, true);
  }, [addCardLater, stripe, elements, cardholderName, complete]);

  return (
    <>
      <ServiceRegistrationTip />

      <div className={"flex flex-col gap-y-4"}>
        <div className={"flex items-start justify-between gap-3"}>
          <div className={"flex flex-col gap-1"}>
            <h3 className={"text-steel-blue font-semibold text-base"}>Debit / Credit Card</h3>
            <p className={helpBase}>
              Secure card registration via Stripe. You can skip and add it later.
            </p>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              className="size-4 accent-royal-blue"
              checked={addCardLater}
              onChange={(e) => setAddCardLater(e.target.checked)}
            />
            <span className="text-sm text-steel-blue font-medium">Add debit card later</span>
          </label>
        </div>

        {!addCardLater && (
          <div className={"bg-white/60 rounded-3xl p-6 flex flex-col gap-y-5"}>
            {!canUseStripe && (
              <div className="text-sm text-red-500 font-medium">
                Stripe Elements is not available on this page. Make sure your registration page is wrapped
                with <code>Elements</code> and a valid publishable key.
              </div>
            )}

            <div>
              <label className={labelBase}>Cardholder name</label>
              <input
                data-card-error={touched.name && !!fieldErrors.name}
                className={elementBaseClass}
                placeholder={"e.g. Kashif Iqbal"}
                value={cardholderName}
                onChange={(e) => setCardholderName(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                disabled={!canUseStripe}
              />
              {touched.name && fieldErrors.name && <div className={errorBase}>{fieldErrors.name}</div>}
            </div>

            <div>
              <label className={labelBase}>Card number</label>
              <div
                data-card-error={touched.number && !!fieldErrors.number}
                className={elementBaseClass}
              >
                <CardNumberElement
                    options={{
    					...stripeElementOptions,
    					disableLink: true, // ⚠️ only if you really want
  						}}
                  onChange={(e: StripeElementChangeEvent) => {
                    setComplete((c) => ({ ...c, number: e.complete }));
                    if (e.error?.message) {
                      setFieldErrors((prev) => ({ ...prev, number: e.error?.message }));
                    } else {
                      setFieldErrors((prev) => ({ ...prev, number: undefined }));
                    }
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, number: true }))}
                />
              </div>
              {touched.number && fieldErrors.number && <div className={errorBase}>{fieldErrors.number}</div>}
            </div>

            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
              <div>
                <label className={labelBase}>Expiry</label>
                <div
                  data-card-error={touched.expiry && !!fieldErrors.expiry}
                  className={elementBaseClass}
                >
                  <CardExpiryElement
                    options={stripeElementOptions}
                    onChange={(e: StripeElementChangeEvent) => {
                      setComplete((c) => ({ ...c, expiry: e.complete }));
                      if (e.error?.message) {
                        setFieldErrors((prev) => ({ ...prev, expiry: e.error?.message }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, expiry: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
                  />
                </div>
                {touched.expiry && fieldErrors.expiry && <div className={errorBase}>{fieldErrors.expiry}</div>}
              </div>

              <div>
                <label className={labelBase}>Security code (CVC)</label>
                <div
                  data-card-error={touched.cvc && !!fieldErrors.cvc}
                  className={elementBaseClass}
                >
                  <CardCvcElement
                    options={stripeElementOptions}
                    onChange={(e: StripeElementChangeEvent) => {
                      setComplete((c) => ({ ...c, cvc: e.complete }));
                      if (e.error?.message) {
                        setFieldErrors((prev) => ({ ...prev, cvc: e.error?.message }));
                      } else {
                        setFieldErrors((prev) => ({ ...prev, cvc: undefined }));
                      }
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, cvc: true }))}
                  />
                </div>
                {touched.cvc && fieldErrors.cvc && <div className={errorBase}>{fieldErrors.cvc}</div>}
              </div>
            </div>

            {pmError && (
              <div data-card-error={true} className="text-sm text-red-500 font-medium">
                {pmError}
              </div>
            )}

            <div className={helpBase}>
              Your card details are processed securely by Stripe. We do not store raw card numbers.
            </div>
          </div>
        )}

        <Separator className={"bg-steel-blue/20"} />

        {/* Keep your existing terms checkbox 
        <CustomCheckbox
          labelClassname={"text-sm"}
          label={"I accept the terms & conditions"}
          id={"service-register-terms-checkbox"}
        />
		*/}
      </div>
    </>
  );
}
