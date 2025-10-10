'use client'

import {
  IServiceRegistrationStep2,
  ServiceRegistrationTip
} from "@/components/register/service-register/service-registration-step-2";
import React from "react";
import {useFieldArray} from "react-hook-form";
import CustomFormFieldSelector from "@/components/app-custom/custom-form-field-selector";
import {ServiceSelector} from "@/components/services/selectors/spare-parts-selector";
import CustomFormFieldMultiSelector from "@/components/app-custom/custom-form-field-multi-selector";
import BrandsMultiSelector from "@/components/register/selectors/brands-multi-selector";
import BoxQuantitySelector from "@/components/register/selectors/box-quantity-selector";
import {Button} from "@/components/ui/button";
import StateMultiSelector from "@/components/register/selectors/state-multi-selector";
import TrashIcon from '@/assets/icons/register/TrashIcon.svg'; // ⬅️ NEW

export default function StoreRegistrationStep2({form}: IServiceRegistrationStep2) {
  const branchesLive = form.getValues(`branches`) as any[];

  return (
    <>
      <ServiceRegistrationTip />

      {branchesLive.map((branch, index) => {
        const { append: appendNewInfoObj, fields: infoArr, remove: removeInfo } = useFieldArray({
          control: form.control,
          name: `branches.${index}.info`
        });

        // ⬇️ If a branch has no services yet, render nothing for this branch
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
                    {/* ⬇️ Delete icon for this service row (hidden for the first row) */}
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
                        name={`branches.${index}.info.${infoIndex}.category`}
                        label={'Select the services *'}
                        Children={(onChange, hasError, value) =>
                          <ServiceSelector value={value} triggerClassname={'h-14'} onChange={onChange} />
                        }
                      />

                      <CustomFormFieldMultiSelector
                        control={form.control}
                        name={`branches.${index}.info.${infoIndex}.carBrands`}
                        label={'Select the car brands *'}
                        Children={(onChange, hasError, value) =>
                          <BrandsMultiSelector value={value} className={'h-14'} onChange={onChange} />
                        }
                      />

                      <CustomFormFieldSelector
                        control={form.control}
                        name={`branches.${index}.info.${infoIndex}.state`}
                        label={'State'}
                        Children={(onChange, hasError, value) =>
                          <StateMultiSelector className={'h-14'} value={value} onChange={onChange}/>
                        }
                      />
                    </div>
                  </React.Fragment>
                )
              })}
            </div>

            {/* Show "+ Add new service" ONLY when there is already at least one service row */}
            <Button
              type={"button"}
              onClick={() => {
                // add a fresh service row; you can include defaults if needed
                appendNewInfoObj({});
              }}
              className={'max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
              + Add new service
            </Button>
          </div>
        )
      })}
    </>
  )
}
