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
import CustomBlueBtnCopy  from "@/components/app-custom/CustomBlueBtnCopy";
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
// JWT VALIDATION UTILITIES
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

// ──────────────────────────────────────────────
// MAIN LOGIN SCREEN
// ──────────────────────────────────────────────
function MainScreen({ setPage }: { setPage: (page: 1 | 2) => void }) {
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

  // ──────────────────────────────────────────────
  // AUTO-FILL FROM LOCALSTORAGE ("Remember me")
  // ──────────────────────────────────────────────
  useEffect(() => {
    const remembered = localStorage.getItem(LS_KEYS.rememberMe) === "true";
    const rememberedEmail = localStorage.getItem(LS_KEYS.rememberEmail) || "";
    setRememberMe(remembered);
    if (remembered && rememberedEmail) {
      form.setValue("email", rememberedEmail);
    }

    // Auto-skip login if already logged in with valid JWT
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

  // ──────────────────────────────────────────────
  // LOGIN SUBMIT HANDLER
  // ──────────────────────────────────────────────
async function onSubmit(values: z.infer<typeof mainScreenFormSchema>) {
  setIsLoading(true);
  try {
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

    // ✅ Save auth info
    localStorage.setItem(LS_KEYS.authResponse, JSON.stringify(data));
    localStorage.setItem(LS_KEYS.authRole, loginType);

    // ✅ Handle "Remember Me"
    if (rememberMe) {
      localStorage.setItem(LS_KEYS.rememberMe, "true");
      localStorage.setItem(LS_KEYS.rememberEmail, values.email);
    } else {
      localStorage.removeItem(LS_KEYS.rememberMe);
      localStorage.removeItem(LS_KEYS.rememberEmail);
    }

    // ✅ Show only one success message
    toast.success("Login successful!");

    // ✅ Close modal after success
    setTimeout(() => {
      // Close the modal immediately after showing success
      const event = new CustomEvent("close-login-modal");
      window.dispatchEvent(event);
      router.push("/services");
    }, 500);
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

        {/* Remember Me checkbox */}
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
// REMAINING SCREENS (Forgot, OTP, Reset Password)
// ──────────────────────────────────────────────
function ForgotPasswordScreen({ setPage }: { setPage: (page: 1 | 2 | 3) => void }) {
  const forgotPasswordFormSchema = z.object({
    accountType: z.enum(["user", "service", "store"]),
    phoneNumber: z.string({ required_error: "Mobile number is required" }).min(7, "Must be at least 7 digits"),
  });

  const form = useForm<z.infer<typeof forgotPasswordFormSchema>>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { accountType: "user", phoneNumber: "" },
  });

  const accountTypeLive = form.watch("accountType");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="flex flex-col gap-y-8 px-8">
        <AccountTypesContainer form={form} accountTypeLive={accountTypeLive} />
        <CustomFormField control={form.control} name="phoneNumber" label="Your mobile number" placeholder="+994" inputType="tel" />
        <CustomBlueBtnCopy onClick={() => setPage(3)} text="Reset password" />
        <Button onClick={() => setPage(1)} className="py-3 px-6 bg-inherit border-0 flex items-center justify-center text-charcoal text-base font-medium">
          Back to log in
        </Button>
      </form>
    </Form>
  );
}

function OTPScreen({ setPage }: { setPage: (page: 1 | 2 | 3 | 4) => void }) {
  const [sec, setSec] = useState(5);
  useEffect(() => {
    const timer = setInterval(() => {
      setSec((prev) => {
        if (prev === 1) clearInterval(timer);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex flex-col gap-y-8 px-8">
      <div className="flex items-center justify-center">
        <CustomOtp />
      </div>
      <CustomBlueBtnCopy onClick={() => setPage(4)} text="Submit" />
      {sec === 0 ? (
        <Button onClick={() => setSec(5)} className="bg-inherit text-center text-sm text-charcoal/40">
          Send again
        </Button>
      ) : (
        <h4 className="text-center text-sm text-charcoal/40">Resend the code in 00:{sec.toString().padStart(2, "0")}</h4>
      )}
    </div>
  );
}

function ResetPasswordScreen({ closeModal }: { closeModal: () => void }) {
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(console.log)} className="flex flex-col gap-y-8 px-8">
        <CustomFormField control={form.control} name="password" label="Password *" placeholder="Your password" inputType="password" />
        <CustomFormField control={form.control} name="passwordRepeat" label="Confirm password *" placeholder="Your password" inputType="password" />
        <CustomBlueBtnCopy onClick={closeModal} text="Confirm" />
      </form>
    </Form>
  );
}

// ──────────────────────────────────────────────
// MAIN MODAL WRAPPER
// ──────────────────────────────────────────────
function LoginPopupModal({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const [page, setPage] = useState(1);
  function closeModal() {
    setIsOpen(false);
    setTimeout(() => setPage(1), 300);
  }

  useEffect(() => {
  const closeHandler = () => setIsOpen(false);
  window.addEventListener("close-login-modal", closeHandler);
  return () => window.removeEventListener("close-login-modal", closeHandler);
}, [setIsOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <DialogContent className={cn("flex flex-col gap-y-8 py-8 max-w-[600px] bg-light-gray rounded-3xl", page === 3 && "max-w-[350px]")}>
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
        {page === 2 && <ForgotPasswordScreen setPage={setPage} />}
        {page === 3 && <OTPScreen setPage={setPage} />}
        {page === 4 && <ResetPasswordScreen closeModal={closeModal} />}
      </DialogContent>
    </Dialog>
  );
}

export default memo(LoginPopupModal);
