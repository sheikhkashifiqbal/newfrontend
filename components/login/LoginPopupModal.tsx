"use client";

import { memo, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import UserIcon from "@/assets/icons/login/user-icon.svg";
import ServiceIcon from "@/assets/icons/login/service-icon.svg";
import StoreIcon from "@/assets/icons/login/store-icon.svg";
import { cn } from "@/lib/utils";
import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomBlueBtnCopy from "@/components/app-custom/CustomBlueBtnCopy";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import CustomOtp from "@/components/app-custom/custom-otp";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

// ──────────────────────────────────────────────
// CONSTANTS
// ──────────────────────────────────────────────
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const LS_KEYS = {
  authResponse: "auth_response",
  authRole: "auth_role",
  rememberMe: "remember_me",
  rememberEmail: "remember_email",
} as const;

// ──────────────────────────────────────────────
function getJwtExpiryEpoch(token?: string): number | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload?.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}
function isJwtValid(token?: string): boolean {
  const exp = getJwtExpiryEpoch(token);
  if (!exp) return false;
  const nowEpoch = Math.floor(Date.now() / 1000);
  return exp > nowEpoch;
}

// ──────────────────────────────────────────────
// ACCOUNT TYPES
// ──────────────────────────────────────────────
type AccountTypesT = {
  value: "user" | "service" | "store";
  text: string;
  icon: any;
};

function AccountTypesContainer({
  form,
  accountTypeLive,
}: {
  form: any;
  accountTypeLive: "user" | "service" | "store";
}) {
  const accountTypes: AccountTypesT[] = [
    { value: "user", text: "User", icon: UserIcon },
    { value: "service", text: "Service", icon: ServiceIcon },
    { value: "store", text: "Store", icon: StoreIcon },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {accountTypes.map((t) => {
        const IconComponent = t.icon;
        return (
          <div
            key={t.value}
            onClick={() => form.setValue("accountType", t.value)}
            className={cn(
              "cursor-pointer bg-white/50 rounded-[12px] py-3 px-5 flex justify-center items-center gap-x-[14px]",
              t.value === accountTypeLive && "bg-white border border-steel-blue/20"
            )}
          >
            <IconComponent className="size-6" />
            <h4 className="text-charcoal text-base font-medium">{t.text}</h4>
          </div>
        );
      })}
    </div>
  );
}

// Map UI accountType to verification/reset API "type"
function mapToVerifyType(accountType: "user" | "service" | "store"): "user" | "manager" {
  return accountType === "user" ? "user" : "manager";
}

// ──────────────────────────────────────────────
// MAIN LOGIN SCREEN (unchanged login flow)
// ──────────────────────────────────────────────
function MainScreen({ setPage }: { setPage: (page: 1 | 2 | 3 | 4) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const mainScreenFormSchema = z.object({
    accountType: z.enum(["user", "service", "store"]),
    email: z.string({ required_error: "Email is required" }).email("Invalid email format"),
    password: z.string({ required_error: "Password is required" }).min(2, "Password too short"),
  });

  const form = useForm<z.infer<typeof mainScreenFormSchema>>({
    resolver: zodResolver(mainScreenFormSchema),
    defaultValues: { accountType: "user", email: "", password: "" },
  });

  useEffect(() => {
    const remembered = localStorage.getItem(LS_KEYS.rememberMe) === "true";
    const rememberedEmail = localStorage.getItem(LS_KEYS.rememberEmail) || "";
    setRememberMe(remembered);
    if (remembered && rememberedEmail) {
      form.setValue("email", rememberedEmail);
    }

    const raw = localStorage.getItem(LS_KEYS.authResponse);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (isJwtValid(parsed?.token)) {
          router.push("/services");
        }
      } catch {}
    }
  }, [form, router]);

  async function onSubmit(values: z.infer<typeof mainScreenFormSchema>) {
    setIsLoading(true);
    try {
      // NOTE: login "type" remains 'branch_manager' for service/store (existing behavior)
      const loginType = values.accountType === "user" ? "user" : "branch_manager";

      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          type: loginType,
        }),
      });

      if (!res.ok) throw new Error("Invalid login credentials");

      const data = await res.json();

      localStorage.setItem(LS_KEYS.authResponse, JSON.stringify(data));
      localStorage.setItem(LS_KEYS.authRole, loginType);

      if (rememberMe) {
        localStorage.setItem(LS_KEYS.rememberMe, "true");
        localStorage.setItem(LS_KEYS.rememberEmail, values.email);
      } else {
        localStorage.removeItem(LS_KEYS.rememberMe);
        localStorage.removeItem(LS_KEYS.rememberEmail);
      }

      toast.success("Login successful!");
      setTimeout(() => {
        const event = new CustomEvent("close-login-modal");
        window.dispatchEvent(event);
        //router.push("/services");
        window.location.reload();

      }, 300);
    } catch (err: any) {
      toast.error("Login failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const PasswordFieldLabel = () => (
    <h4 onClick={() => setPage(2)} className="cursor-pointer text-royal-blue text-sm font-medium">
      Forgot password?
    </h4>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-6 px-8">
        <AccountTypesContainer form={form} accountTypeLive={form.watch("accountType")} />

        <CustomFormField control={form.control} name="email" placeholder="E-mail address" label="Your e-mail" inputType="email" />
        <CustomFormField
          control={form.control}
          name="password"
          placeholder="Your password"
          label="Password *"
          rightMostLabel={<PasswordFieldLabel />}
          inputType="password"
        />

        {/* Remember Me */}
        <div className="flex items-center gap-2">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={() => setRememberMe((v) => !v)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="rememberMe" className="text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <CustomBlueBtnCopy text={isLoading ? "Logging in..." : "Log in"} disabled={isLoading} />

        <div className="px-6 flex items-center justify-center gap-2">
          <h4 className="text-base font-medium text-charcoal">Don't have an account?</h4>
          <Link className="text-base font-semibold text-royal-blue" href="/register">
            Sign up
          </Link>
        </div>
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────
// TYPES for verification + reset flow
// ──────────────────────────────────────────────
type VerifyState = {
  type: "user" | "manager";
  matchedType: "email" | "mobile";
  matchedValue: string;
  code: string;
} | null;

// ──────────────────────────────────────────────
// FORGOT PASSWORD SCREEN (toggling Email/Mobile + verify API)
// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// FORGOT PASSWORD SCREEN (toggling Email/Mobile + verify API)
// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// FORGOT PASSWORD SCREEN (email/mobile optional: only one required)
// ──────────────────────────────────────────────
function ForgotPasswordScreen({
  setPage,
  setVerifyState,
}: {
  setPage: (page: 1 | 2 | 3 | 4) => void;
  setVerifyState: (s: VerifyState) => void;
}) {

  // 🔥 FORCE email only — remove mobile logic
  const form = useForm({
    resolver: zodResolver(
      z.object({
        accountType: z.enum(["user", "service", "store"]),
        email: z.string().email("Invalid email"),
      })
    ),
    defaultValues: { accountType: "user", email: "" },
  });

  async function handleVerify(values: any) {
    const typeForAPI = mapToVerifyType(values.accountType);

    const body = {
      email: values.email,
      mobile: "",
      type: typeForAPI,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/verify/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data?.result && data?.code) {
        setVerifyState({
          type: typeForAPI,
          matchedType: "email",
          matchedValue: values.email,
          code: String(data.code),
        });

        toast.success("Verification code sent.");
        setPage(3);
      } else {
        toast.error("No matching email found.");
      }
    } catch (e: any) {
      toast.error("Verification failed: " + e.message);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleVerify)} className="flex flex-col gap-y-6 px-8">

        <AccountTypesContainer form={form} accountTypeLive={form.watch("accountType") as "user" | "service" | "store"}
/>

        {/* 🔥 Only email input remains */}
        <CustomFormField
          control={form.control}
          name="email"
          label="Your email"
          placeholder="you@example.com"
          inputType="email"
        />

        <CustomBlueBtnCopy type="submit" text="Send code" />

        <Button
          type="button"
          onClick={() => setPage(1)}
          className="py-3 px-6 bg-inherit border-0 flex items-center justify-center text-charcoal text-base font-medium"
        >
          Back to log in
        </Button>
      </form>
    </Form>
  );
}


// ──────────────────────────────────────────────
function OTPScreen({
  setPage,
  verifyState,
}: {
  setPage: (page: 1 | 2 | 3 | 4) => void;
  verifyState: VerifyState;
}) {
  const [sec, setSec] = useState(60);
  const [otp, setOtp] = useState("");

  // 🔥 Sync when user types in CustomOtp
  const handleOtpChange = (val: string) => {
    setOtp(val);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSec((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function submitOtp() {
    if (!verifyState) {
      toast.error("Session expired.");
      return;
    }
    if (otp.trim() === verifyState.code) {
      toast.success("Code verified");
      setPage(4);
    } else {
      toast.error("Invalid code");
    }
  }

  return (
    <div className="flex flex-col gap-y-6 px-8">

      {/* 🔥 Editable OTP and synced */}
      <CustomOtp value={otp} onChange={handleOtpChange} />

      {/* 🔥 This input is now editable and synced */}
      <div>
        <label className="block text-sm text-charcoal mb-1">Enter the 4-digit code</label>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full rounded-lg border px-3 py-2 text-sm outline-none border-gray-300 focus:ring-2 focus:ring-blue-500"
          placeholder="1234"
        />
      </div>

      <CustomBlueBtnCopy onClick={submitOtp} text="Submit" />

      {sec === 0 ? (
        <Button onClick={() => setSec(60)} className="bg-inherit text-center text-sm text-charcoal/60">
          Send again
        </Button>
      ) : (
        <h4 className="text-center text-sm text-charcoal/60">Resend in 00:{sec.toString().padStart(2, "0")}</h4>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
function ResetPasswordScreen({
  closeModal,
  verifyState,
}: {
  closeModal: () => void;
  verifyState: VerifyState;
}) {
  const router = useRouter();

  const resetPasswordFormSchema = z
    .object({
      password: z.string({ required_error: "Password required" }).min(8, "Min 8 characters"),
      passwordRepeat: z.string({ required_error: "Confirm password required" }),
    })
    .refine((d) => d.password === d.passwordRepeat, { message: "Passwords do not match", path: ["passwordRepeat"] });

  const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: "", passwordRepeat: "" },
  });

  async function onSubmit(values: z.infer<typeof resetPasswordFormSchema>) {
    if (!verifyState) {
      toast.error("Verification session expired.");
      return;
    }

    // Build request per matchedType
    const payload: Record<string, any> = {
      password: values.password,
      type: verifyState.type, // "user" | "manager"
    };
    if (verifyState.matchedType === "email") {
      payload.email = verifyState.matchedValue;
    } else {
      payload.mobile = verifyState.matchedValue;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      // Expecting: { success: true, message: "...", matchedBy, matchedValue }
      if (data?.success) {
        toast.success(data?.message || "Password reset successfully");
        closeModal();
        // optional: router.push('/services')
      } else {
        toast.error(data?.message || "Password reset failed");
      }
    } catch (e: any) {
      toast.error("Reset failed: " + (e?.message ?? "Unknown error"));
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-y-8 px-8">
        <CustomFormField control={form.control} name="password" label="Password *" placeholder="New password" inputType="password" />
        <CustomFormField control={form.control} name="passwordRepeat" label="Confirm password *" placeholder="Retype password" inputType="password" />
        <CustomBlueBtnCopy type="submit" text="Confirm" />
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────
// MAIN MODAL WRAPPER
// ──────────────────────────────────────────────
function LoginPopupModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [page, setPage] = useState<1 | 2 | 3 | 4>(1);

  // Shared verify state across Forgot → OTP → Reset
  const [verifyState, setVerifyState] = useState<VerifyState>(null);

  function closeModal() {
    setIsOpen(false);
    setTimeout(() => {
      setPage(1);
      setVerifyState(null);
    }, 300);
  }

  useEffect(() => {
    const closeHandler = () => setIsOpen(false);
    window.addEventListener("close-login-modal", closeHandler);
    return () => window.removeEventListener("close-login-modal", closeHandler);
  }, [setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent
        className={cn(
          "flex flex-col gap-y-8 py-8 max-w-[600px] bg-light-gray rounded-3xl",
          page === 3 && "max-w-[350px]"
        )}
      >
        <DialogHeader className="p-8 pt-0 border-b border-b-blue-gray flex justify-between">
          <DialogTitle className="flex flex-col gap-2 text-charcoal text-2xl font-medium">
            {page === 1
              ? "Log in to your account"
              : page === 2
              ? "Forgot the password?"
              : page === 3
              ? "Enter the code"
              : "Set new password"}
          </DialogTitle>
          <DialogPrimitive.Close onClick={closeModal}>
            <X className="size-6 text-charcoal/50" />
          </DialogPrimitive.Close>
        </DialogHeader>

        {page === 1 && <MainScreen setPage={setPage} />}
        {page === 2 && <ForgotPasswordScreen setPage={setPage} setVerifyState={setVerifyState} />}
        {page === 3 && <OTPScreen setPage={setPage} verifyState={verifyState} />}
        {page === 4 && <ResetPasswordScreen closeModal={closeModal} verifyState={verifyState} />}
      </DialogContent>
    </Dialog>
  );
}

export default memo(LoginPopupModal);
