'use client'

import React, { useEffect, useMemo, useRef, useState } from "react";
import { ServiceRegistrationTip } from "@/components/register/service-register/service-registration-step-2";
import CustomCheckbox from "@/components/app-custom/custom-checkbox";
import { Separator } from "@/components/ui/separator";

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

const fieldBase =
  "w-full bg-white rounded-[12px] border border-steel-blue/20 px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/40 outline-none focus:border-royal-blue/60";
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

  const [addCardLater, setAddCardLater] = useState<boolean>(!!form?.getValues?.("addDebitCardLater"));
  const [cardholderName, setCardholderName] = useState<string>(form?.getValues?.("cardholderName") ?? "");
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

  // Prevent infinite requestSubmit loops
  const allowNextSubmitRef = useRef(false);

  const canUseStripe = useMemo(() => !!stripe && !!elements, [stripe, elements]);

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
  }, [addCardLater, form]);

  function validateLocalFields() {
    if (addCardLater) {
      setFieldErrors({});
      return true;
    }

    const next: typeof fieldErrors = {};
    if (!cardholderName.trim()) next.name = "Cardholder name is required.";
    if (!complete.number) next.number = "Card number is incomplete or invalid.";
    if (!complete.expiry) next.expiry = "Expiry date is incomplete or invalid.";
    if (!complete.cvc) next.cvc = "Security code is incomplete or invalid.";

    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function createPaymentMethodIfNeeded(): Promise<boolean> {
    if (addCardLater) return true;

    const okLocal = validateLocalFields();
    if (!okLocal) return false;

    if (!stripe || !elements) {
      setPmError("Stripe is not ready. Please refresh and try again.");
      return false;
    }

    const existingPm = form?.getValues?.("stripePaymentMethodId");
    if (existingPm) return true; // already created

    const cardNumberEl = elements.getElement(CardNumberElement);
    if (!cardNumberEl) {
      setPmError("Card input is not available. Please refresh and try again.");
      return false;
    }

    setPmError("");

    const result = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumberEl,
      billing_details: {
        name: cardholderName.trim(),
      },
    });

    if (result.error) {
      setPmError(result.error.message || "Card validation failed. Please check your details.");
      return false;
    }

    const pmId = result.paymentMethod?.id || "";
    if (!pmId) {
      setPmError("Could not create payment method. Please try again.");
      return false;
    }

    try {
      form?.setValue?.("stripePaymentMethodId", pmId, { shouldDirty: true });
    } catch {
      // ignore
    }

    return true;
  }

  // Intercept submit: ensure PM is created BEFORE ServiceRegistrationFull onSubmit runs
  useEffect(() => {
    const formEl = document.querySelector("form");
    if (!formEl) return;

    const onSubmitCapture = async (e: Event) => {
      // If we already validated and re-triggered submit, allow it to pass
      if (allowNextSubmitRef.current) {
        allowNextSubmitRef.current = false;
        return;
      }

      // If skipping card, allow submit normally
      if (addCardLater) return;

      // We are on step-3; create PaymentMethod first
      e.preventDefault();
      e.stopPropagation();

      setTouched({ name: true, number: true, expiry: true, cvc: true });

      const ok = await createPaymentMethodIfNeeded();
      if (!ok) {
        try {
          const first = document.querySelector("[data-card-error='true']");
          first?.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch {
          // ignore
        }
        return;
      }

      // Allow the next submit to go through to the main onSubmit handler
      allowNextSubmitRef.current = true;
      try {
        // @ts-ignore
        formEl.requestSubmit?.();
      } catch {
        // @ts-ignore
        formEl.submit?.();
      }
    };

    formEl.addEventListener("submit", onSubmitCapture, true);
    return () => formEl.removeEventListener("submit", onSubmitCapture, true);
  }, [addCardLater, stripe, elements, cardholderName, complete, form]);

  return (
    <>
      <ServiceRegistrationTip />

      <div className={"flex flex-col gap-y-4"}>
        <div className={"flex items-start justify-between gap-3"}>
          <div className={"flex flex-col gap-1"}>
            <h3 className={"text-steel-blue font-semibold text-base"}>Debit / Credit Card</h3>
            <p className={helpBase}>
              Add a card for subscription billing (Stripe). You can skip and add it later.
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
                Stripe Elements is not available on this page. Make sure your register page is wrapped with{" "}
                <code>Elements</code> and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set.
              </div>
            )}

            <div>
              <label className={labelBase}>Cardholder name</label>
              <input
                data-card-error={touched.name && !!fieldErrors.name}
                className={fieldBase}
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
              <div data-card-error={touched.number && !!fieldErrors.number} className={fieldBase}>
                <CardNumberElement
                  options={stripeElementOptions}
                  onChange={(e: StripeElementChangeEvent) => {
                    setComplete((c) => ({ ...c, number: e.complete }));
                    if (e.error?.message) setFieldErrors((p) => ({ ...p, number: e.error?.message }));
                    else setFieldErrors((p) => ({ ...p, number: undefined }));
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, number: true }))}
                />
              </div>
              {touched.number && fieldErrors.number && <div className={errorBase}>{fieldErrors.number}</div>}
            </div>

            <div className={"grid grid-cols-1 sm:grid-cols-2 gap-4"}>
              <div>
                <label className={labelBase}>Expiry</label>
                <div data-card-error={touched.expiry && !!fieldErrors.expiry} className={fieldBase}>
                  <CardExpiryElement
                    options={stripeElementOptions}
                    onChange={(e: StripeElementChangeEvent) => {
                      setComplete((c) => ({ ...c, expiry: e.complete }));
                      if (e.error?.message) setFieldErrors((p) => ({ ...p, expiry: e.error?.message }));
                      else setFieldErrors((p) => ({ ...p, expiry: undefined }));
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, expiry: true }))}
                  />
                </div>
                {touched.expiry && fieldErrors.expiry && <div className={errorBase}>{fieldErrors.expiry}</div>}
              </div>

              <div>
                <label className={labelBase}>Security code (CVC)</label>
                <div data-card-error={touched.cvc && !!fieldErrors.cvc} className={fieldBase}>
                  <CardCvcElement
                    options={stripeElementOptions}
                    onChange={(e: StripeElementChangeEvent) => {
                      setComplete((c) => ({ ...c, cvc: e.complete }));
                      if (e.error?.message) setFieldErrors((p) => ({ ...p, cvc: e.error?.message }));
                      else setFieldErrors((p) => ({ ...p, cvc: undefined }));
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

        <CustomCheckbox
          labelClassname={"text-sm"}
          label={"I accept the terms & conditions"}
          id={"service-register-terms-checkbox"}
        />
      </div>
    </>
  );
}
