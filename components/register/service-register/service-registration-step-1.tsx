'use client'

import CustomFormField from "@/components/app-custom/CustomFormField";
import CustomFormFieldFile from "@/components/app-custom/custom-form-field-file";
import TrashIcon from "@/assets/icons/register/TrashIcon.svg";
import {Button} from "@/components/ui/button";
import {useFieldArray} from "react-hook-form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import WorkHoursSelector from "@/components/register/selectors/work-hours-selector";
import WorkDaysSelector from "@/components/register/selectors/work-days-selector";
import {useEffect, useState} from "react";

interface IServiceRegistrationStep1 {
  form: any;
  type?: "service" | "store"
}

export default function ServiceRegistrationStep1({
  form,
  type = "service"
}: IServiceRegistrationStep1) {

  const {fields: branchesLive, append, remove} = useFieldArray({
    control: form.control,
    name: 'branches'
  })

  const divGridClassname = 'grid grid-cols-1 gap-6 500:grid-cols-2';

  // ===== Base URL for APIs
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // ===== Helper to interpret various possible backend responses
  async function isDuplicateFrom(url: string): Promise<boolean> {
    const res = await fetch(url, { method: "GET" });
    if (!res.ok) {
      if (res.status === 409 || res.status === 422) return true;
      return false;
    }
    const json: any = await res.json().catch(() => ({}));
    if (typeof json === "boolean") return !json ? true : false;
    if ("isUnique" in json) return json.isUnique === false;
    if ("duplicate" in json) return !!json.duplicate;
    if (typeof json.message === "string") return /duplicate/i.test(json.message);
    return false;
  }

  // Optional blur validators (pre-submit checks are still enforced in Full.tsx)
  const validateCompanyName = async (val: string) => {
    if (!val) return null;
    const dup = await isDuplicateFrom(`${BASE_URL}/api/companies/check/company-name?name=${encodeURIComponent(val)}`);
    return dup ? "Duplicate company name" : null;
  };
  const validateBrandName = async (val: string) => {
    if (!val) return null;
    const dup = await isDuplicateFrom(`${BASE_URL}/api/companies/check/brand-name?name=${encodeURIComponent(val)}`);
    return dup ? "Duplicate brand name" : null;
  };
  const validateManagerEmail = async (val: string) => {
    if (!val) return null;
    const dup = await isDuplicateFrom(`${BASE_URL}/api/companies/check/manager-email?email=${encodeURIComponent(val)}`);
    return dup ? "Duplicate email" : null;
  };
  const validateBranchLoginEmail = async (val: string) => {
    if (!val) return null;
    const dup = await isDuplicateFrom(`${BASE_URL}/api/branches/check/email?email=${encodeURIComponent(val)}`);
    return dup ? "Duplicate email" : null;
  };

  // ===== Cities (for dropdown after Address, before Location)
  const [cities, setCities] = useState<Array<{ id: number|string; name: string }>>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingCities(true);
        setCitiesError(null);
        const res = await fetch(`${BASE_URL}/api/cities`);
        if (!res.ok) throw new Error(`Failed to load cities: ${res.status}`);
        const data = await res.json();
        const mapped = Array.isArray(data)
          ? data.map((c: any) => ({
              id: String(c?.city ?? c?.id ?? c),
              name: String(c?.city ?? c?.name ?? c),
            }))
          : [];
        if (alive) setCities(mapped);
      } catch (e: any) {
        if (alive) setCitiesError(e?.message || "Failed to load cities");
      } finally {
        if (alive) setLoadingCities(false);
      }
    })();
    return () => { alive = false; }
  }, []);

  return (
    <>
      <h5 className={'text-steel-blue text-base font-semibold'}>Company Details</h5>

      <div className={divGridClassname}>
        <CustomFormField
          name={'companyName'}
          isItalicPlaceholder={true}
          placeholder={'Type your company name'}
          label={'Company name *'}
          control={form.control}
          asyncValidate={validateCompanyName}
        />

        <CustomFormField
          name={'brandName'}
          isItalicPlaceholder={true}
          placeholder={'Type your brand name'}
          label={'Brand name *'}
          control={form.control}
          asyncValidate={validateBrandName}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormField
          name={'taxId'}
          isItalicPlaceholder={true}
          placeholder={'Type your TIN number'}
          label={'Tax ID *'}
          control={form.control}
        />

        <CustomFormField
          name={'managerName'}
          isItalicPlaceholder={true}
          placeholder={'Contact person’s name'}
          label={"Manager's name *"}
          control={form.control}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormField
          name={'managerSurname'}
          isItalicPlaceholder={true}
          placeholder={'Contact person’s surname'}
          label={"Manager's surname *"}
          control={form.control}
        />

        <CustomFormField
          inputType={'tel'}
          name={'managerStationaryPhone'}
          isItalicPlaceholder={true}
          placeholder={"Type your stationary phone"}
          label={"Manager’s stationary phone"}
          control={form.control}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormField
          inputType={'tel'}
          name={'managerMobileNumber'}
          isItalicPlaceholder={true}
          placeholder={"Type your mobile phone"}
          label={"Manager’s mobile number *"}
          control={form.control}
        />

        <CustomFormField
          name={'email'}
          isItalicPlaceholder={true}
          placeholder={"Type your e-mail address *"}
          label={"E-mail address *"}
          control={form.control}
          asyncValidate={validateManagerEmail}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormField
          name={'website'}
          isItalicPlaceholder={true}
          placeholder={"Type your website"}
          label={"Website"}
          control={form.control}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormField
          name={'password'}
          isItalicPlaceholder={true}
          placeholder={"Type your password"}
          label={"Your password *"}
          control={form.control}
        />
        <CustomFormField
          name={'repeatPassword'}
          isItalicPlaceholder={true}
          placeholder={"Type your repeat password"}
          label={"Your password repeat*"}
          control={form.control}
        />
      </div>

      <div className={divGridClassname}>
        <CustomFormFieldFile
          control={form.control}
          label={'Upload your TIN Photo *'}
          name={'tinPhoto'}
        />
      </div>

      <div className={'flex flex-col pt-8 gap-y-3'}>
        <h5 className={'text-steel-blue text-base font-medium'}>Branch details</h5>

        {branchesLive.map((branch, index) => {
          return (
            <div className={'flex flex-col gap-y-3 mt-4'} key={branch.id}>
              {/* Header with delete icon (hidden for first branch) */}
              <div className="flex items-center justify-between">
                <h6 className="text-base font-medium text-steel-blue">Branch {index + 1}</h6>
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    aria-label="Delete branch"
                    className="p-2 rounded hover:bg-slate-100"
                    title="Delete branch"
                  >
                    <TrashIcon width="35px" height="38px"/>
                  </button>
                )}
              </div>

              <div className={'grid grid-cols-1 gap-6'}>
                <CustomFormField
                  name={`branches.${index}.name`}
                  isItalicPlaceholder={true}
                  placeholder={"ex., Shamakhi branch"}
                  label={"Branch name *"}
                  control={form.control}
                />
              </div>

              <div className={divGridClassname}>
                <CustomFormField
                  name={`branches.${index}.code`}
                  isItalicPlaceholder={true}
                  placeholder={"ex., Shamakhi branch"}
                  label={"Branch code *"}
                  control={form.control}
                />
                <CustomFormField
                  name={`branches.${index}.managerName`}
                  isItalicPlaceholder={true}
                  placeholder={"Enter branch manager’s name"}
                  label={"Branch manager’s name *"}
                  control={form.control}
                />
              </div>

              <div className={divGridClassname}>
                <CustomFormField
                  name={`branches.${index}.managerSurname`}
                  isItalicPlaceholder={true}
                  placeholder={"Enter branch manager’s surname"}
                  label={"Branch manager’s surname *"}
                  control={form.control}
                />
                <CustomFormField
                  name={`branches.${index}.address`}
                  isItalicPlaceholder={true}
                  placeholder={"Type your address"}
                  label={"Address *"}
                  control={form.control}
                />
              </div>

              {/* City selector (after Address, before Location) */}
              <div className={divGridClassname}>
                <CustomFormFieldSelector
                  name={`branches.${index}.city`}
                  label={"City *"}
                  control={form.control}
                  Children={(onChange, hasError, value) => (
                    <select
                      className={`h-14 w-full border rounded p-2 ${hasError ? 'border-vibrant-red' : 'border-soft-gray'}`}
                      value={value ?? ""}
                      onChange={(e) => onChange(e.target.value)}
                    >
                      <option value="" disabled>
                        {loadingCities ? "Loading cities..." : (citiesError ? "Failed to load cities" : "Select city")}
                      </option>
                      {cities.map((c) => (
                        <option key={String(c.id)} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <CustomFormField
                  name={`branches.${index}.email`}
                  isItalicPlaceholder={true}
                  placeholder={"Your email address"}
                  label={"Login e-mail for branch *"}
                  control={form.control}
                  asyncValidate={validateBranchLoginEmail}
                />
              </div>
                           <div className={divGridClassname}>
                <CustomFormField
                        name={`branches.${index}.password`}
                        isItalicPlaceholder={true}
                        placeholder={"Type your password"}
                        label={"Login password for branch *"}
                        control={form.control}
                />
                <CustomFormField
                        name={`branches.${index}.repeatPassword`}
                        isItalicPlaceholder={true}
                        placeholder={"Retype your password"}
                        label={"Repeat login password for branch *"}
                        control={form.control}
                />
            </div>

              <div className={divGridClassname}>
                <CustomFormField
                  name={`branches.${index}.location`}
                  isItalicPlaceholder={true}
                  placeholder={"Location map"}
                  label={"Location Map *"}
                  control={form.control}
                />
                <CustomFormFieldSelector
                  name={`branches.${index}.workDays`}
                  isItalicPlaceholder={true}
                  placeholder={"Select the workdays"}
                  label={"Workdays *"}
                  control={form.control}
                  Children={(onChange, hasError, value) => <WorkDaysSelector form={form} value={value} onChange={onChange}/>}
                />
              </div>

              <div className={divGridClassname}>
                <CustomFormFieldSelector
                  name={`branches.${index}.workHours`}
                  isItalicPlaceholder={true}
                  placeholder={"Select your working hours"}
                  label={"Working hours*"}
                  control={form.control}
                  Children={(onChange, hasError, value) => <WorkHoursSelector form={form} value={value} onChange={onChange}/>}
                />
                <CustomFormFieldFile
                control={form.control}
                label={'Upload branch logo *'}
                name={`branches.${index}.logo`}
                                        // <- ADDED (optional)
                />
              </div>
              <div className={divGridClassname}>

                <CustomFormFieldFile
                control={form.control}
                label={'Upload branch cover *'}
                name={`branches.${index}.cover`}
                                        // <- ADDED (optional)
                />
            </div>

              {/* remaining fields (passwords, files) unchanged */}
            </div>
          )
        })}

        <Button
          type={"button"}
          onClick={() => {
            // IMPORTANT FIX: do NOT pre-seed a service row for new branches
            // Previously: info: [{ boxQuantity: 1 }]
            // Now:       info: []
            append({
              info: [],                  // ⬅️ no auto service row
              workHours: [undefined, undefined],
              workDays: [],
              city: ""
            })
          }}
          className={'mt-8 max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
          + Add new branch
        </Button>
      </div>
    </>
  )
}
