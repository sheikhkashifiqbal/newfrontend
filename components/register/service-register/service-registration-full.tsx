"use client"
import {memo, useEffect, useState} from "react";
import {z} from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form} from "@/components/ui/form";

import ServiceRegistrationStep1 from "@/components/register/service-register/service-registration-step-1";
import ServiceRegistrationHeader from "@/components/register/service-register/service-registration-header";
import ServiceRegistrationBottomButtons
  from "@/components/register/service-register/service-registration-bottom-buttons";
import ServiceRegistrationStep2 from "@/components/register/service-register/service-registration-step-2";
//import ServiceRegistrationStep3 from "@/components/register/service-register/service-registration-step-3";
import {fileSchema} from "@/lib/utils";

// API endpoints
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_UPLOAD    = `${BASE_URL}/api/upload`;
const API_COMPANIES = `${BASE_URL}/api/companies`;
const API_BRANCHES  = `${BASE_URL}/api/branches`;
const API_SERVICES  = `${BASE_URL}/api/service-entities`;
const API_BRANCH_BRAND_SERVICES = `${BASE_URL}/api/branch-brand-services`;

interface IServiceRegistration {
  closeFormAndGoBack: () => void
  openPopup: () => void
}

function ServiceRegistrationFull({closeFormAndGoBack, openPopup}: IServiceRegistration) {
  const [step,setStep] = useState<1 | 2 >(1);

  // Load lists (services)
  const [services, setServices] = useState<
  Array<{ serviceId: number | string; serviceName: string; serviceType?: string }>
>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLists(true);
        const sRes = await fetch(API_SERVICES);
        if (!sRes.ok) throw new Error(`Services failed: ${sRes.status}`);
        const sJson = await sRes.json();
        setServices(
          Array.isArray(sJson)
            ? sJson.map((x: any) => ({
                serviceId: x.serviceId ?? x.id ?? x.service_id,
                serviceName: x.serviceName ?? x.name ?? String(x),
                // new: serviceType coming from backend
                serviceType: x.serviceType ?? x.service_type ?? undefined,
              }))
            : []
        );

      } catch (e) {
        console.error(e);
      } finally {
        setLoadingLists(false);
      }
    })();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  // File schema (kept)
  const fileSchema = z
    .instanceof(File, {message: 'Not a valid file format!'})
    .refine((file) => ["image/jpeg", "image/jpg", "image/png"].includes(file.type), {
      message: "Only JPEG, JPG and PNG files are allowed",
    })
    .refine((file) => file.size <= 2 * 1024 * 1024, {
      message: "File size must be less than 2MB",
    });

  const serviceBranchInfoSchema = z.object({
    service: z.string({required_error: "Select the service"}),
    carBrands: z.array(z.string({required_error: "Select at least 1 car brand"}), {required_error: "Select at least 1 car brand"})
      .min(1, {message: "Select at least 1 car brand"}),
  });

  // ⬇️ Working-hours rule changed to superRefine (from > to ⇒ error)
  const serviceBranchFormSchema = z.object({
    name: z.string({required_error: 'branch name is required'}).min(3, "branch name must be at least 3 characters"),
    code: z.string({required_error: 'branch code is required'}).min(3, "branch code must be at least 3 characters"),
    managerName: z.string({required_error: 'manager name is required'}).min(3, "manager name must be at least 3 characters"),
    managerSurname: z.string({required_error: 'manager surname is required'}).min(3, "manager surname must be at least 3 characters"),
    address: z.string({required_error: 'address is required'}).min(3, "address must be at least 3 characters"),
    city: z.string({ required_error: 'city is required'}).min(1, "city is required"),
    location: z.string({required_error: 'location is required'}).min(3, "location must be at least 3 characters"),
    workDays: z.array(z.string({required_error: "Select work days"}), {required_error: "Select work days"})
      .min(1, {message: "Select at least 1 work day"}).max(7),
    workHours: z.array(z.string({required_error: "Select work hours"}), {required_error: "Select work hours"})
      .length(2, {message: "Select work hours"}),
    email: z.string({required_error: 'email is required'}).email('provide a valid email address'),
    password: z.string({required_error: 'password is required'}).min(8, 'password must be at least 8 characters'),
    repeatPassword: z.string({required_error: 'repeat password is required'}),
    logo: fileSchema,
    cover: fileSchema,
    info: z.array(serviceBranchInfoSchema).min(1, {message: "Provide at least 1 info"})
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match',
    path: ['repeatPassword'],
  })
  .superRefine((data, ctx) => {
    const [from, to] = data.workHours || [];
    if (from && to) {
      const toMinutes = (hhmm: string) => {
        const [h, m = "0"] = String(hhmm).split(":");
        return Number(h) * 60 + Number(m);
      };
      if (toMinutes(from) > toMinutes(to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Invalid working hours",
          path: ["workHours"],
        });
      }
    }
  });

  const optionalUrl = z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().url("provide a valid URL (e.g., https://example.com)").max(2048).optional()
  );

  const serviceRegistrationFormSchema = z.object({
    companyName: z.string({required_error: 'company name is required'}).min(3, "company name must be at least 3 characters"),
    brandName: z.string({required_error: 'brand name is required'}).min(3, "brand name must be at least 3 characters"),
    taxId: z.string({required_error: 'tax id is required'}).min(3, "tax id must be at least 3 characters"),
    managerName: z.string({required_error: 'manager name is required'}).min(3, "manager name must be at least 3 characters"),
    managerSurname: z.string({required_error: 'manager surname is required'}).min(3, "manager surname must be at least 3 characters"),
    managerStationaryPhone: z.string({required_error: 'stationary phone is required'}).min(3, "stationary phone must be at least 3 characters"),
    managerMobileNumber: z.string({required_error: 'mobile number is required'}).min(3, "mobile number must be at least 3 characters"),
    email: z.string({required_error: 'email is required'}).email('provide a valid email address'),
    website: optionalUrl,
    password: z.string({required_error: 'password is required'}).min(8, 'password must be at least 8 characters'),
    repeatPassword: z.string({required_error: 'repeat password is required'}),
    tinPhoto: fileSchema,
    branches: z.array(serviceBranchFormSchema).min(1)
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: 'Passwords do not match',
    path: ['repeatPassword'],
  });

  const form = useForm<z.infer<typeof serviceRegistrationFormSchema>>({
    resolver: zodResolver(serviceRegistrationFormSchema),
    defaultValues: {
      branches: [
        {
          info: [{}],
          workHours: [undefined, undefined],
          workDays: []
        }
      ]
    },
    mode: "onChange"
  });

  // helpers
  function ts() {
    const d = new Date();
    const pad = (n:number)=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
  }
  function stampedNameFromFile(file: File) {
    const dot = file.name.lastIndexOf('.');
    const base = dot > -1 ? file.name.substring(0, dot) : file.name;
    const ext  = dot > -1 ? file.name.substring(dot) : '';
    return `${base}-${ts()}${ext}`;
  }
  function extractCompanyId(payload: any): number {
    const keys = ["companyId","id","company_id","CompanyId"];
    for (const k of keys) if (payload && typeof payload[k] === "number") return payload[k];
    throw new Error("Could not determine companyId from response");
  }
  function extractBranchId(payload: any): number {
    const keys = ["branchId","id","branch_id","BranchId"];
    for (const k of keys) if (payload && typeof payload[k] === "number") return payload[k];
    throw new Error("Could not determine branchId from response");
  }
  async function uploadToSpringUploadAPI(file: File, stampedName: string): Promise<string> {
    const fd = new FormData();
    fd.set("file", file);
    fd.set("filename", stampedName);
    const res = await fetch(API_UPLOAD, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.filename as string;
  }

  // ===== Duplicate-check helper used before submit
  async function isDuplicateFrom(url: string): Promise<boolean> {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      if (res.status === 409 || res.status === 422) return true;
      return false; // don't block on transient errors
    }
    const json: any = await res.json().catch(() => ({}));
    if (typeof json === "boolean") return json === false;       // treat false as duplicate
    if ("isUnique" in json)   return json.isUnique === false;
    if ("duplicate" in json)  return !!json.duplicate;
    if (typeof json.message === "string") return /duplicate/i.test(json.message);
    return false;
  }

  // Submit
  async function onSubmit(values: z.infer<typeof serviceRegistrationFormSchema>) {
    // ---- PRE-SUBMIT DUPLICATE CHECKS (block both company & branch POSTs if any fail) ----
    const dupErrors: Array<{ path: string; message: string }> = [];

    const managerEmailDup = await isDuplicateFrom(
      `${BASE_URL}/api/companies/check/manager-email?email=${encodeURIComponent(values.email)}`
    );
    if (managerEmailDup) dupErrors.push({ path: "email", message: "Duplicate email" });

    const companyDup = await isDuplicateFrom(
      `${BASE_URL}/api/companies/check/company-name?name=${encodeURIComponent(values.companyName)}`
    );
    if (companyDup) dupErrors.push({ path: "companyName", message: "Duplicate company name" });

    const brandDup = await isDuplicateFrom(
      `${BASE_URL}/api/companies/check/brand-name?name=${encodeURIComponent(values.brandName)}`
    );
    if (brandDup) dupErrors.push({ path: "brandName", message: "Duplicate brand name" });

    for (let i = 0; i < values.branches.length; i++) {
      const be = values.branches[i]?.email;
      if (be) {
        const branchEmailDup = await isDuplicateFrom(
          `${BASE_URL}/api/branches/check/email?email=${encodeURIComponent(be)}`
        );
        if (branchEmailDup) {
          dupErrors.push({ path: `branches.${i}.email`, message: "Duplicate email" });
        }
      }
    }

    if (dupErrors.length) {
      dupErrors.forEach(({ path, message }) => form.setError(path as any, { type: "server", message }));
      return; // ⛔ stop submit (no company/branch POST)
    }

    // ---- CONTINUE normal flow: upload & POST ----
    const tin = values.tinPhoto as File;
    const tinStamped = stampedNameFromFile(tin);
    const tinFilename = await uploadToSpringUploadAPI(tin, tinStamped);

    const companyPayload = {
      companyName: values.companyName,
      brandName: values.brandName,
      taxId: values.taxId,
      managerName: values.managerName,
      managerSurname: values.managerSurname,
      managerPhone: values.managerStationaryPhone,
      managerMobile: values.managerMobileNumber,
      managerEmail: values.email,
      website: values.website,
      password: values.password,
      tinPhoto: tinFilename
    };

    const companyRes = await fetch(API_COMPANIES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(companyPayload),
    });
    if (!companyRes.ok) {
      throw new Error(`Company create failed: ${companyRes.status} ${await companyRes.text()}`);
    }
    const companyJson = await companyRes.json().catch(()=> ({}));
    const companyId = extractCompanyId(companyJson);

    for (const b of values.branches) {
      const logo  = b.logo as File;
      const cover = b.cover as File;

      const logoStamped  = stampedNameFromFile(logo);
      const coverStamped = stampedNameFromFile(cover);

      const logoFilename  = await uploadToSpringUploadAPI(logo,  logoStamped);
      const coverFilename = await uploadToSpringUploadAPI(cover, coverStamped);

      const branchPayload = {
        companyId,
        branchName: b.name,
        branchCode: b.code,
        branchManagerName: b.managerName,
        branchManagerSurname: b.managerSurname,
        branchAddress: b.address,
        city: b.city,
        location: b.location,
        workDays: (b.workDays || []) as string[],
        from: (b.workHours?.[0] ?? "") as string,
        to:   (b.workHours?.[1] ?? "") as string,
        loginEmail: b.email,
        password: b.password,
        logoImg: logoFilename,
        branchCoverImg: coverFilename,
        status: "approved"
      };

      const branchRes = await fetch(API_BRANCHES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(branchPayload),
      });
      if (!branchRes.ok) {
        throw new Error(`Branch create failed: ${branchRes.status} ${await branchRes.text()}`);
      }
      const branchJson = await branchRes.json().catch(() => ({}));
      const branchId = extractBranchId(branchJson);

      // link this branch to selected service(s) and brand(s)
      for (const info of (b as any).info || []) {
        const serviceId = Number(info.service);
        const qty = Number(info.boxQuantity ?? 1);
        const brandIds = Array.isArray(info.carBrands)
          ? info.carBrands.map((x: any) => Number(x)).filter((n: any) => Number.isFinite(n))
          : [];

      const payloads = brandIds.map((brandId: number) => ({
        branchId,
        brandId,
        serviceId,
        qty,
        experts: Number((b as any).experts ?? 1)   // <-- NEW
      }));


        await Promise.all(
          payloads.map((p:any)  =>
            fetch(API_BRANCH_BRAND_SERVICES, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(p),
            })
          )
        );
      }
    }

    // Success
    openPopup?.();
  }

  return (
    <div className={'pt-10 pb-20 mx-auto w-[806px] h-full flex flex-col gap-y-6'}>
      <ServiceRegistrationHeader step={step}/>

      <Form {...form}>
        <form className={'flex flex-col gap-y-5'} onSubmit={form.handleSubmit(onSubmit)}>
          {step === 1 && <ServiceRegistrationStep1 form={form} />}
          {step === 2 && <ServiceRegistrationStep2 form={form} services={services} brands={brands} loadingLists={loadingLists} />}

          <div className="pt-6">
            <button type="submit" className="reg-company hidden">Register Company & Branches</button>
          </div>
        </form>
      </Form>

      <ServiceRegistrationBottomButtons
        form={form}
        step={step}
        setStep={setStep}
        closeFormAndGoBack={closeFormAndGoBack}
        openPopup={openPopup}
      />
    </div>
  )
}

export default memo(ServiceRegistrationFull)
