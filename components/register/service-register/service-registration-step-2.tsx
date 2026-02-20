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
  services?: Array<{ serviceId: number | string; serviceName: string; serviceType?: string }>
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

        // Don't render block if empty
        if (!infoArr || infoArr.length === 0) {
          return null;
        }

        // Get all selected services from other rows (to disable them)
        const getSelectedServices = (currentInfoIndex: number) => {
          return infoArr
            .map((info, idx) => idx !== currentInfoIndex ? form.getValues(`branches.${index}.info.${idx}.service`) : null)
            .filter((serviceId): serviceId is string => serviceId != null && serviceId !== "");
        };

        return (
          <div className={'bg-white/80 border border-black/5 p-8 rounded-3xl flex flex-col gap-8'} key={index}>
            <h4 className={'text-base font-medium text-steel-blue'}>Shamakhi Central Branch *</h4>

            {/* 🔥 Moved Box Quantity UP (Always one) */}
            <div className="grid grid-cols-1 530:grid-cols-2 700:grid-cols-3 gap-6">
              <CustomFormFieldSelector
                control={form.control}
                name={`branches.${index}.boxQuantity`}
                label={'Select Box quantity *'}
                Children={(onChange, hasError, value) => (
                  <BoxQuantitySelector
                    value={(Number.isFinite(Number(value)) && Number(value) >= 1) ? Number(value) : 1}
                    onChange={onChange}
                  />
                )}
              />

              {/* 🔥 New Experts Selector (Non-repeating) */}
              <CustomFormFieldSelector
                control={form.control}
                name={`branches.${index}.experts`}
                label={'Select the experts *'}
                Children={(onChange, hasError, value) => (
                  <BoxQuantitySelector
                    value={(Number.isFinite(Number(value)) && Number(value) >= 1) ? Number(value) : 1}
                    onChange={onChange}
                  />
                )}
              />
            </div>

            {/* Repeating service configuration */}
            <div className={'flex flex-col gap-8'}>
              {infoArr.map((info, infoIndex) => (
                <React.Fragment key={info.id}>
                  {infoIndex > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeInfo(infoIndex)}
                        className="p-2 rounded hover:bg-slate-100"
                      >
                        <TrashIcon width="35px" height="38px"/>
                      </button>
                    </div>
                  )}

                  <div className={'grid grid-cols-1 530:grid-cols-2 700:grid-cols-3 gap-6'}>
                    
                    {/* 🔧 REQUIREMENT #3 → Modify service dropdown text */}
                    <CustomFormFieldSelector
                      control={form.control}
                      name={`branches.${index}.info.${infoIndex}.service`}
                      label={'Select the services *'}
                      Children={(onChange, hasError, value) => {
                        // Get services selected in other rows
                        const selectedServices = getSelectedServices(infoIndex);
                        
                        return (services && services.length)
                          ? (
                            <select
                              className={`h-14 w-full border rounded p-2 ${hasError ? 'border-red-500' : 'border-gray-300'}`}
                              value={value ?? ""}
                              onChange={(e) => onChange(e.target.value)}
                              disabled={loadingLists}
                            >
                              <option value="" disabled>Select a service</option>
                                {services
                                  .filter((s) => {
                                    const serviceIdStr = String(s.serviceId);
                                    // Keep current selection, remove others that are selected in different rows
                                    return value === serviceIdStr || !selectedServices.includes(serviceIdStr);
                                  })
                                  .map((s) => {
                                    const label = s.serviceType
                                      ? `${s.serviceName} (${s.serviceType})`
                                      : s.serviceName;
                                    
                                    const serviceIdStr = String(s.serviceId);

                                    return (
                                      <option 
                                        key={serviceIdStr} 
                                        value={serviceIdStr}
                                      >
                                        {label}
                                      </option>
                                    );
                                  })}

                            </select>
                          )
                          : (
                            <ServiceSelector
                              value={value}
                              triggerClassname={'h-14'}
                              onChange={onChange}
                            />
                          )
                      }}
                    />

                    <CustomFormFieldMultiSelector
                      name={`branches.${index}.info.${infoIndex}.carBrands`}
                      control={form.control}
                      label={'Select the car brands *'}
                      Children={(onChange, hasError, value) => (
                        <BrandsMultiSelector value={value} className="h-14" onChange={onChange} />
                      )}
                    />
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* + Add new service row */}
            <Button
              type={"button"}
              onClick={() => appendNewInfoObj({ boxQuantity: 1 })}
              className={'max-w-fit bg-soft-gray py-3 px-4 rounded-[12px] text-dark-gray text-base font-medium'}>
              + Add new service
            </Button>
          </div>
        )
      })}
    </>
  )
}
