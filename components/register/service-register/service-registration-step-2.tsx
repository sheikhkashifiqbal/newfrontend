'use client'

import TipIcon from '@/assets/icons/register/TipIcon.svg'
import TrashIcon from '@/assets/icons/register/TrashIcon.svg'
import {useFieldArray} from "react-hook-form";
import CustomFormFieldMultiSelector from "@/components/app-custom/custom-form-field-multi-selector";
import BrandsMultiSelector from "@/components/register/selectors/brands-multi-selector";
import BoxQuantitySelector from "@/components/register/selectors/box-quantity-selector";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {Button} from "@/components/ui/button";
import React from "react";
import {ServiceSelector} from "@/components/services/selectors/service-selector";

export interface IServiceRegistrationStep2 {
  form: any
  services?: Array<{ serviceId: number | string; serviceName: string }>
  brands?: string[]
  loadingLists?: boolean
}

export function ServiceRegistrationTip() {
  return (
    <div className={'w-full py-4 px-5 flex flex-col gap-3 rounded-[12px] bg-sunset-peach/20'}>
      <div className={'flex items-center gap-x-1'}>
        
        <TipIcon />
        <h5 className={'text-xs text-dark-gray'}>Tip</h5>
      </div>
      <h4 className={'text-xs text-dark-gray leading-[1.25rem]'}>
        When you choose 2 or more car brands it means services you selected applies to these brands. If you want another services for one (or more) of the brands, add new car brand
      </h4>
    </div>
  )
}

export default function ServiceRegistrationStep2({form, services, brands, loadingLists}: IServiceRegistrationStep2) {
  const branchesLive = form.getValues(`branches`) as any[];

  return (
    <>
      <ServiceRegistrationTip />

      {branchesLive.map((branch, index) => {
        const {append: appendNewInfoObj, fields: infoArr, remove: removeInfo} = useFieldArray({
          control: form.control,
          name: `branches.${index}.info`
        });

        // ❗️Key change: If this branch has NO services yet, render nothing at all
        if (!infoArr || infoArr.length === 0) {
          return null;
        }

        return (
          <div className={'bg-white/80 border border-black/5 p-8 rounded-3xl flex flex-col gap-8'} key={index}>
            <h4 className={'text-base font-medium text-steel-blue'}>Shamakhi Central Branch *</h4>

            <div className={'flex flex-col gap-8'}>
              {infoArr.map((info, infoIndex) => {
                return (
                  <React.Fragment key={info.id}>
                    {/* Delete icon per service row (hidden for the first row in each branch) */}
                    {infoIndex > 0 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeInfo(infoIndex)}
                          aria-label="Delete service"
                          className="p-2 rounded hover:bg-slate-100"
                          title="Delete service"
                        >
                          <TrashIcon width="35px" height="38px"/>
                        </button>
                      </div>
                    )}

                    <div className={'grid grid-cols-1 530:grid-cols-2 700:grid-cols-3 gap-6'}>
                      <CustomFormFieldSelector
                        control={form.control}
                        name={`branches.${index}.info.${infoIndex}.service`}
                        label={'Select the services *'}
                        Children={(onChange, hasError, value) =>
                          (services && services.length)
                            ? (
                              <select
                                className={`h-14 w-full border rounded p-2 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                                value={value ?? ""}
                                onChange={(e) => onChange(e.target.value)}
                                disabled={loadingLists}
                              >
                                <option value="" disabled>Select a service</option>
                                {services.map(s => (
                                  <option key={String(s.serviceId)} value={String(s.serviceId)}>
                                    {s.serviceName}
                                  </option>
                                ))}
                              </select>
                            )
                            : (
                              <ServiceSelector value={value} triggerClassname={'h-14'} onChange={onChange} />
                            )
                        }
                      />

                      <CustomFormFieldMultiSelector
                        control={form.control}
                        name={`branches.${index}.info.${infoIndex}.carBrands`}
                        label={'Select the car brands *'}
                        Children={(onChange, hasError, value) => (
                          <BrandsMultiSelector
                            value={value}
                            className={`h-14 ${hasError ? 'border-red-500' : ''}`}
                            onChange={onChange}
                          />
                        )}
                      />

                      <CustomFormFieldSelector
                        control={form.control}
                        name={`branches.${index}.info.${infoIndex}.boxQuantity`}
                        label={'Select Box quantity'}
                        Children={(onChange, hasError, value) => (
                          <BoxQuantitySelector
                            value={(Number.isFinite(Number(value)) && Number(value) >= 1) ? Number(value) : 1}
                            onChange={onChange}
                          />
                        )}
                      />
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            {/* This button shows only when there is already at least one service row */}
            <Button
              type={"button"}
              onClick={() => appendNewInfoObj({boxQuantity: 1})}
              className={'max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
              + Add new service
            </Button>
          </div>
        )
      })}
    </>
  )
}
